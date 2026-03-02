const mongoose = require('mongoose');

const streetlightSchema = new mongoose.Schema(
  {
    codice: { type: String },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 60 },
    funzionante: { type: Boolean, default: true }
  },
  { timestamps: true }
);

streetlightSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Streetlight', streetlightSchema);
