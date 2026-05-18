const Report = require('../models/Report');

async function getStats(req, res) {
  const { from, to, categoria } = req.query;
  const match = {};
  if (categoria) match.categoria = categoria;
  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  try {
    const [totale, perCategoria, perStato, perGiorno, perZona] = await Promise.all([
      Report.countDocuments(match),
      Report.aggregate([
        { $match: match },
        { $group: { _id: '$categoria', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: match },
        { $group: { _id: '$stato', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              lat: { $round: [{ $arrayElemAt: ['$posizione.coordinates', 1] }, 2] },
              lng: { $round: [{ $arrayElemAt: ['$posizione.coordinates', 0] }, 2] }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      totale,
      perCategoria: perCategoria.map((r) => ({ categoria: r._id, count: r.count })),
      perStato: perStato.map((r) => ({ stato: r._id, count: r.count })),
      perGiorno: perGiorno.map((r) => ({ giorno: r._id, count: r.count })),
      perZona: perZona.map((r) => ({ lat: r._id.lat, lng: r._id.lng, count: r.count }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il calcolo delle statistiche' });
  }
}

module.exports = { getStats };
