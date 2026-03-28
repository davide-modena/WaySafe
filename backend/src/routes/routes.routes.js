const express = require('express');
const { calcolaPercorsoSicuro } = require('../services/routing.service');

const router = express.Router();

function leggiPunti(req) {
  const { start, end } = req.body;
  const valido = (p) => p && typeof p.lat === 'number' && typeof p.lng === 'number';
  if (!valido(start) || !valido(end)) return null;
  return { start, end };
}

router.post('/safest', async (req, res) => {
  const punti = leggiPunti(req);
  if (!punti) {
    return res.status(400).json({ error: 'start e end con lat/lng numerici sono richiesti' });
  }

  try {
    const risultato = await calcolaPercorsoSicuro(punti.start, punti.end);
    res.json(risultato);
  } catch (err) {
    res.status(502).json({ error: 'Calcolo percorso non riuscito' });
  }
});

module.exports = router;
