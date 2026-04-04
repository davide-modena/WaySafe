const { buildHeatmap, stradaPiuVicina } = require('./heatmap.service');

const OSRM_BASE = process.env.OSRM_URL || 'https://routing.openstreetmap.de/routed-foot';

const livelloDaScore = (s) => (s >= 65 ? 'safe' : s >= 45 ? 'moderate' : s >= 30 ? 'risk' : 'danger');

async function osrmPercorsi(start, end, alternatives) {
  const coppie = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'true',
    alternatives: alternatives ? 'true' : 'false'
  });

  const resp = await fetch(`${OSRM_BASE}/route/v1/foot/${coppie}?${params.toString()}`);
  if (!resp.ok) throw new Error('OSRM non raggiungibile');

  const dati = await resp.json();
  if (dati.code !== 'Ok' || !dati.routes || dati.routes.length === 0) {
    throw new Error('Nessun percorso trovato');
  }

  return dati.routes;
}

function estraiTappe(route) {
  const leg = route.legs && route.legs[0];
  if (!leg || !leg.steps) return [];

  return leg.steps
    .filter((s) => s.maneuver)
    .map((s) => ({
      manovra: s.maneuver.type,
      direzione: s.maneuver.modifier || null,
      strada: s.name || null,
      distanceM: Math.round(s.distance)
    }));
}

function valutaPercorso(route, geojson) {
  const coords = route.geometry.coordinates;
  const maxCampioni = 40;
  const step = Math.max(1, Math.floor(coords.length / maxCampioni));
  const livelli = { safe: 0, moderate: 0, risk: 0, danger: 0 };

  let somma = 0;
  let campioni = 0;
  let minimo = 100;

  for (let i = 0; i < coords.length; i += step) {
    const [lng, lat] = coords[i];
    const { nearest, minDist } = stradaPiuVicina(geojson, lat, lng);
    if (nearest && minDist <= 60) {
      const s = nearest.properties.safetyScore;
      somma += s;
      campioni += 1;
      if (s < minimo) minimo = s;
      livelli[nearest.properties.safetyLevel] += 1;
    }
  }

  const media = campioni > 0 ? Math.round(somma / campioni) : 50;

  return {
    geometry: route.geometry,
    distanceM: Math.round(route.distance),
    durationS: Math.round(route.duration),
    safetyScore: media,
    safetyLevel: livelloDaScore(media),
    minScore: campioni > 0 ? minimo : null,
    breakdown: livelli,
    tappe: estraiTappe(route)
  };
}

async function calcolaPercorsoSicuro(start, end) {
  const geojson = await buildHeatmap();
  const routes = await osrmPercorsi(start, end, true);
  const valutati = routes.map((r) => valutaPercorso(r, geojson));
  valutati.sort((a, b) => b.safetyScore - a.safetyScore);

  const [safest, ...resto] = valutati;
  return { start, end, route: safest, alternatives: resto };
}

function normalizzaPesi(pesi) {
  const sicurezza = Number.isFinite(pesi && pesi.sicurezza) ? Math.max(0, pesi.sicurezza) : 0.6;
  const rapidita = Number.isFinite(pesi && pesi.rapidita) ? Math.max(0, pesi.rapidita) : 0.4;
  const totale = sicurezza + rapidita || 1;
  return { sicurezza: sicurezza / totale, rapidita: rapidita / totale };
}

async function calcolaPercorsoBilanciato(start, end, pesi) {
  const geojson = await buildHeatmap();
  const routes = await osrmPercorsi(start, end, true);
  const pesiNorm = normalizzaPesi(pesi);
  const valutati = routes.map((r) => valutaPercorso(r, geojson));

  const distanze = valutati.map((v) => v.distanceM);
  const minD = Math.min(...distanze);
  const maxD = Math.max(...distanze);
  const range = maxD - minD || 1;

  const conUtilita = valutati.map((v) => {
    const sicurezzaNorm = v.safetyScore / 100;
    const rapiditaNorm = 1 - (v.distanceM - minD) / range;
    const utilita = pesiNorm.sicurezza * sicurezzaNorm + pesiNorm.rapidita * rapiditaNorm;
    return { ...v, utilita: Math.round(utilita * 100) };
  });

  conUtilita.sort((a, b) => b.utilita - a.utilita);
  const [migliore, ...resto] = conUtilita;
  return { start, end, pesi: pesiNorm, route: migliore, alternatives: resto };
}

module.exports = { calcolaPercorsoSicuro, calcolaPercorsoBilanciato, osrmPercorsi, valutaPercorso };
