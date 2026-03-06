const path = require('path');
const fs = require('fs');

const { calcolaPunteggio, distanzaMetri } = require('./safetyScore');
const Streetlight = require('../models/Streetlight');
const Camera = require('../models/Camera');
const Patrol = require('../models/Patrol');
const Intervention = require('../models/Intervention');
const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const Evento = require('../models/Evento');
const CrowdLevel = require('../models/CrowdLevel');

const geojsonPath = path.join(__dirname, '../../data/trento-streets.geojson');
const tipiEsclusi = ['motorway', 'motorway_link', 'construction', 'raceway', 'platform'];

let cache = null;

function coord(doc) {
  return { lat: doc.posizione.coordinates[1], lng: doc.posizione.coordinates[0] };
}

async function caricaFonti() {
  const [lampioni, telecamere, pattugliamenti, interventi, segnalazioni, feedback, eventi, affluenza] =
    await Promise.all([
      Streetlight.find().lean(),
      Camera.find().lean(),
      Patrol.find().lean(),
      Intervention.find().lean(),
      Report.find({ stato: 'approvata' }).lean(),
      Feedback.find().lean(),
      Evento.find().lean(),
      CrowdLevel.find().lean()
    ]);

  return {
    lampioni: lampioni.map((d) => ({ ...coord(d), radiusM: d.radiusM, funzionante: d.funzionante })),
    telecamere: telecamere.map((d) => ({ ...coord(d), radiusM: d.radiusM, attiva: d.attiva })),
    pattugliamenti: pattugliamenti.map((d) => ({ ...coord(d), radiusM: d.radiusM, frequenzaSettimanale: d.frequenzaSettimanale })),
    interventi: interventi.map((d) => ({ ...coord(d), data: d.data, count: d.count })),
    segnalazioni: segnalazioni.map((d) => ({ ...coord(d), categoria: d.categoria, createdAt: d.createdAt })),
    feedback: feedback.map((d) => ({ ...coord(d), radiusM: d.radiusM, valutazione: d.valutazione })),
    eventi: eventi.map((d) => ({ ...coord(d), radiusM: d.radiusM, tipo: d.tipo, attivo: d.attivo })),
    affluenza: affluenza.map((d) => ({ ...coord(d), radiusM: d.radiusM, densita: d.densita, fasceOrarie: d.fasceOrarie }))
  };
}

async function buildHeatmap() {
  if (cache) return cache;

  const raw = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  const fonti = await caricaFonti();

  const features = raw.features
    .filter((f) => f.geometry.type === 'LineString' && !tipiEsclusi.includes(f.properties && f.properties.highway))
    .map((f) => {
      const { score, level } = calcolaPunteggio(f, fonti);
      return {
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          id: f.properties['@id'],
          name: f.properties.name || null,
          highway: f.properties.highway,
          safetyScore: score,
          safetyLevel: level
        }
      };
    });

  cache = { type: 'FeatureCollection', features };
  return cache;
}

function invalidaCache() {
  cache = null;
}

function filtraBbox(geojson, south, west, north, east) {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter((f) =>
      f.geometry.coordinates.some(
        ([lng, lat]) => lat >= south && lat <= north && lng >= west && lng <= east
      )
    )
  };
}

function distPuntoSegmento(lat, lng, aLat, aLng, bLat, bLng) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const cosLat = Math.cos(toRad(lat));

  const px = (lng - aLng) * cosLat * R * toRad(1);
  const py = (lat - aLat) * R * toRad(1);
  const bx = (bLng - aLng) * cosLat * R * toRad(1);
  const by = (bLat - aLat) * R * toRad(1);

  const ab2 = bx * bx + by * by;
  if (ab2 === 0) return Math.sqrt(px * px + py * py);

  const t = Math.max(0, Math.min(1, (px * bx + py * by) / ab2));
  const dx = px - t * bx;
  const dy = py - t * by;
  return Math.sqrt(dx * dx + dy * dy);
}

function distPuntoLineString(lat, lng, coords) {
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const [aLng, aLat] = coords[i];
    const [bLng, bLat] = coords[i + 1];
    const d = distPuntoSegmento(lat, lng, aLat, aLng, bLat, bLng);
    if (d < minDist) minDist = d;
  }
  if (minDist === Infinity && coords.length > 0) {
    const [cLng, cLat] = coords[0];
    minDist = distanzaMetri(lat, lng, cLat, cLng);
  }
  return minDist;
}

function stradaPiuVicina(geojson, lat, lng) {
  const candidatiEntro = (delta) =>
    geojson.features.filter((f) =>
      f.geometry.coordinates.some(
        ([cLng, cLat]) => Math.abs(cLat - lat) <= delta && Math.abs(cLng - lng) <= delta
      )
    );

  let candidati = candidatiEntro(0.0008);
  if (candidati.length < 4) candidati = candidatiEntro(0.002);
  const pool = candidati.length > 0 ? candidati : geojson.features;

  let nearest = null;
  let minDist = Infinity;
  for (const f of pool) {
    const d = distPuntoLineString(lat, lng, f.geometry.coordinates);
    if (d < minDist) {
      minDist = d;
      nearest = f;
    }
  }

  return { nearest, minDist };
}

module.exports = { buildHeatmap, invalidaCache, filtraBbox, stradaPiuVicina };
