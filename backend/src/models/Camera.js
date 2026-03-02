const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema(
  {
    codice: { type: String },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 60 },
    attiva: { type: Boolean, default: true },
    tipo: { type: String, enum: ['fisso', 'ptz'], default: 'fisso' }
  },
  { timestamps: true }
);

cameraSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Camera', cameraSchema);
