const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, ruolo: user.ruolo },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    nome: user.nome,
    cognome: user.cognome,
    email: user.email,
    ruolo: user.ruolo,
    percorsoPreferito: user.percorsoPreferito,
    notifiche: user.notifiche,
    lingua: user.lingua
  };
}

async function register(req, res) {
  const { nome, cognome, email, password } = req.body;
  if (!nome || !cognome || !email || !password) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const esistente = await User.findOne({ email });
    if (esistente) {
      return res.status(409).json({ error: 'Email già registrata' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ nome, cognome, email, passwordHash });
    const token = signToken(user);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Credenziali mancanti' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const valida = await bcrypt.compare(password, user.passwordHash);
    if (!valida) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante l\'accesso' });
  }
}

module.exports = { register, login, signToken, publicUser };
