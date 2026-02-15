const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    cognome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String },
    ruolo: { type: String, enum: ['utente', 'operatore', 'admin'], default: 'utente' },
    percorsoPreferito: { type: String, enum: ['piu_sicuro', 'bilanciato'], default: 'piu_sicuro' },
    notifiche: { type: Boolean, default: true },
    lingua: { type: String, enum: ['it', 'en', 'de', 'es', 'fr'], default: 'it' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
