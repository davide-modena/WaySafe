const mongoose = require('mongoose');

const patrolSchema = new mongoose.Schema(
  {
    zona: { type: String },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 300 },
    giorniSettimana: { type: Number, default: 7 },
    fasceOrarie: { type: [String], default: [] },
    frequenzaSettimanale: { type: Number, default: 0 }
  },
  { timestamps: true }
);

patrolSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Patrol', patrolSchema);
