const Report = require('../models/Report');
const { invalidaCache } = require('../services/heatmap.service');

const statiValidi = ['in_attesa', 'approvata', 'rifiutata', 'risolta', 'archiviata'];

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

async function listOperatorReports(req, res) {
  const { stato } = req.query;
  const filtro = {};
  if (stato) {
    if (!statiValidi.includes(stato)) {
      return res.status(400).json({ error: 'Stato non valido' });
    }
    filtro.stato = stato;
  } else {
    filtro.stato = 'in_attesa';
  }

  try {
    const reports = await Report.find(filtro)
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('userId', 'nome cognome email')
      .lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il recupero delle segnalazioni' });
  }
}

async function updateReportStato(req, res) {
  const { stato } = req.body;
  if (!statiValidi.includes(stato)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { stato }, { new: true });
    if (!report) {
      return res.status(404).json({ error: 'Segnalazione non trovata' });
    }
    invalidaCache();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della segnalazione' });
  }
}

module.exports = { createReport, listReports, listOperatorReports, updateReportStato };
