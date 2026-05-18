const Notification = require('../models/Notification');

async function listNotifications(req, res) {
  const { nonLette } = req.query;
  const filtro = { userId: req.user.id };
  if (nonLette === 'true') filtro.letta = false;

  try {
    const notifiche = await Notification.find(filtro)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const conteggioNonLette = await Notification.countDocuments({
      userId: req.user.id,
      letta: false
    });
    res.json({ notifiche, nonLette: conteggioNonLette });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle notifiche' });
  }
}

async function markLetta(req, res) {
  try {
    const notifica = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { letta: true },
      { new: true }
    );
    if (!notifica) {
      return res.status(404).json({ error: 'Notifica non trovata' });
    }
    res.json(notifica);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della notifica' });
  }
}

async function markTutteLette(req, res) {
  try {
    await Notification.updateMany(
      { userId: req.user.id, letta: false },
      { letta: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'aggiornamento delle notifiche' });
  }
}

async function creaNotifica(dati) {
  try {
    return await Notification.create(dati);
  } catch (err) {
    return null;
  }
}

module.exports = { listNotifications, markLetta, markTutteLette, creaNotifica };
