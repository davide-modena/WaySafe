const express = require('express');
const { buildHeatmap, filtraBbox, stradaPiuVicina } = require('../services/heatmap.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const geojson = await buildHeatmap();
    const { bbox } = req.query;
    if (!bbox) return res.json(geojson);

    const parts = bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      return res.status(400).json({ error: 'bbox non valido. Formato: south,west,north,east' });
    }

    const [south, west, north, east] = parts;
    res.json(filtraBbox(geojson, south, west, north, east));
  } catch (err) {
    res.status(500).json({ error: 'Errore nel calcolo della heatmap' });
  }
});

router.get('/point', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Parametri lat e lng richiesti' });
  }

  try {
    const geojson = await buildHeatmap();
    const { nearest, minDist } = stradaPiuVicina(geojson, lat, lng);

    if (!nearest || minDist > 40) {
      return res.status(404).json({ error: 'Nessuna strada trovata nelle vicinanze' });
    }

    res.json({
      safetyLevel: nearest.properties.safetyLevel,
      safetyScore: nearest.properties.safetyScore,
      streetName: nearest.properties.name,
      distanceM: Math.round(minDist)
    });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel calcolo della heatmap' });
  }
});

module.exports = router;
