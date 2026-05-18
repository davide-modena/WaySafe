const User = require('../models/User');
const { publicUser } = require('./auth.controller');

const campiModificabili = ['nome', 'cognome', 'email', 'percorsoPreferito', 'notifiche', 'lingua'];

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero del profilo' });
  }
}

async function updateMe(req, res) {
  const aggiornamenti = {};
  campiModificabili.forEach((campo) => {
    if (req.body[campo] !== undefined) aggiornamenti[campo] = req.body[campo];
  });

  try {
    if (aggiornamenti.email) {
      const esistente = await User.findOne({ email: aggiornamenti.email, _id: { $ne: req.user.id } });
      if (esistente) {
        return res.status(409).json({ error: 'Email già in uso' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, aggiornamenti, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il salvataggio del profilo' });
  }
}

module.exports = { getMe, updateMe };
