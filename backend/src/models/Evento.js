const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema(
  {
    operatoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tipo: {
      type: String,
      enum: ['cantiere', 'manifestazione', 'strada_chiusa', 'evento'],
      required: true
    },
    titolo: { type: String, required: true, trim: true },
    descrizione: { type: String, trim: true },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 150 },
    attivo: { type: Boolean, default: true },
    inizioAt: { type: Date },
    fineAt: { type: Date }
  },
  { timestamps: true }
);

eventoSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Evento', eventoSchema);
