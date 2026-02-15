const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    categoria: {
      type: String,
      enum: ['scarsa_illuminazione', 'comportamenti_sospetti', 'strade_danneggiate', 'altro'],
      required: true
    },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    descrizione: { type: String, trim: true },
    stato: {
      type: String,
      enum: ['in_attesa', 'approvata', 'rifiutata', 'risolta', 'archiviata'],
      default: 'in_attesa'
    }
  },
  { timestamps: true }
);

reportSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);
