function distanzaMetri(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function puntoMedio(coordinates) {
  const mid = coordinates[Math.floor(coordinates.length / 2)];
  return { lat: mid[1], lng: mid[0] };
}

function giorniFa(data) {
  return (Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24);
}

function pesoRecenza(giorni) {
  if (giorni <= 7) return 1;
  if (giorni <= 14) return 0.6;
  if (giorni <= 30) return 0.3;
  return 0.1;
}

function fasciaOraria() {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return 'mattina';
  if (h >= 13 && h < 19) return 'pomeriggio';
  if (h >= 19 && h < 23) return 'sera';
  return 'notte';
}

const basePerTipo = {
  primary: 65,
  secondary: 62,
  trunk: 60,
  trunk_link: 58,
  secondary_link: 58,
  tertiary: 52,
  tertiary_link: 50,
  residential: 48,
  pedestrian: 52,
  living_street: 50,
  unclassified: 38,
  service: 35,
  footway: 30,
  cycleway: 30,
  path: 25,
  track: 20,
  steps: 22
};

const densitaPunteggio = { alta: 12, media: 6, bassa: 0 };

const penalitaSegnalazione = {
  scarsa_illuminazione: 6,
  comportamenti_sospetti: 8,
  strade_danneggiate: 4,
  altro: 3
};

function calcolaPunteggio(feature, fonti) {
  const props = feature.properties || {};
  const hw = props.highway || '';
  const lit = props.lit || '';
  const { lat, lng } = puntoMedio(feature.geometry.coordinates);
  const fascia = fasciaOraria();

  let score = basePerTipo[hw] ?? 35;

  if (lit === 'yes' || lit === '24/7') score += 10;
  if (lit === 'no') score -= 10;

  const lampioniVicini = fonti.lampioni.filter(
    (l) => distanzaMetri(lat, lng, l.lat, l.lng) <= l.radiusM
  );
  score += Math.min(lampioniVicini.filter((l) => l.funzionante).length * 6, 15);
  score -= lampioniVicini.filter((l) => !l.funzionante).length * 3;

  const cameraVicine = fonti.telecamere.filter(
    (c) => c.attiva && distanzaMetri(lat, lng, c.lat, c.lng) <= c.radiusM
  );
  score += Math.min(cameraVicine.length * 5, 12);

  fonti.pattugliamenti
    .filter((p) => distanzaMetri(lat, lng, p.lat, p.lng) <= p.radiusM)
    .forEach((p) => {
      if (p.frequenzaSettimanale >= 10) score += 10;
      else if (p.frequenzaSettimanale >= 5) score += 6;
      else score += 3;
    });

  fonti.interventi.forEach((i) => {
    if (distanzaMetri(lat, lng, i.lat, i.lng) <= 150) {
      score -= i.count * 5 * pesoRecenza(giorniFa(i.data));
    }
  });

  fonti.segnalazioni.forEach((s) => {
    if (distanzaMetri(lat, lng, s.lat, s.lng) <= 120) {
      score -= (penalitaSegnalazione[s.categoria] ?? 4) * pesoRecenza(giorniFa(s.createdAt));
    }
  });

  fonti.feedback.forEach((f) => {
    if (distanzaMetri(lat, lng, f.lat, f.lng) <= f.radiusM) {
      if (f.valutazione === 'sicuro') score += 4;
      else if (f.valutazione === 'buio') score -= 5;
      else if (f.valutazione === 'trafficato') score -= 2;
    }
  });

  fonti.affluenza.forEach((a) => {
    if (distanzaMetri(lat, lng, a.lat, a.lng) <= a.radiusM) {
      const densitaOra = (a.fasceOrarie && a.fasceOrarie[fascia]) || a.densita;
      score += densitaPunteggio[densitaOra] ?? 0;
    }
  });

  fonti.eventi.forEach((e) => {
    if (!e.attivo) return;
    if (distanzaMetri(lat, lng, e.lat, e.lng) <= e.radiusM) {
      if (e.tipo === 'strada_chiusa') score -= 20;
      else if (e.tipo === 'cantiere') score -= 10;
      else if (e.tipo === 'manifestazione') score -= 5;
      else if (e.tipo === 'evento') score += 3;
    }
  });

  score = Math.max(0, Math.min(100, Math.round(score)));

  const level =
    score >= 70 ? 'safe' : score >= 50 ? 'moderate' : score >= 35 ? 'risk' : 'danger';

  return { score, level };
}

module.exports = { calcolaPunteggio, puntoMedio, distanzaMetri };
