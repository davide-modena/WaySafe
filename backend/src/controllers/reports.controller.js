const Report = require('../models/Report');

async function createReport(req, res) {
  const { categoria, lat, lng, descrizione } = req.body;
  if (!categoria || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Categoria e posizione sono obbligatorie' });
  }

  try {
    const report = await Report.create({
      userId: req.user.id,
      categoria,
      posizione: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
      descrizione
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la creazione della segnalazione' });
  }
}

async function listReports(req, res) {
  const { bbox, stato, categoria } = req.query;
  const filtro = { stato: stato || 'approvata' };
  if (categoria) filtro.categoria = categoria;

  if (bbox) {
    const parts = bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) {
      return res.status(400).json({ error: 'bbox non valido. Formato: south,west,north,east' });
    }
    const [south, west, north, east] = parts;
    filtro.posizione = {
      $geoWithin: { $box: [[west, south], [east, north]] }
    };
  }

  try {
    const reports = await Report.find(filtro).sort({ createdAt: -1 }).limit(500).lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il recupero delle segnalazioni' });
  }
}

module.exports = { createReport, listReports };
