const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const { signToken } = require('../src/controllers/auth.controller');

async function creaUtente(dati = {}) {
  const passwordHash = await bcrypt.hash(dati.password || 'password123', 10);
  const user = await User.create({
    nome: dati.nome || 'Mario',
    cognome: dati.cognome || 'Rossi',
    email: dati.email || 'mario.rossi@test.it',
    passwordHash,
    ruolo: dati.ruolo || 'utente'
  });
  return { user, token: signToken(user) };
}

module.exports = { creaUtente };
