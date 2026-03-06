const mongoose = require('mongoose');

const crowdLevelSchema = new mongoose.Schema(
  {
    zona: { type: String },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 250 },
    densita: { type: String, enum: ['alta', 'media', 'bassa'], default: 'media' },
    fasceOrarie: {
      mattina: { type: String, enum: ['alta', 'media', 'bassa'] },
      pomeriggio: { type: String, enum: ['alta', 'media', 'bassa'] },
      sera: { type: String, enum: ['alta', 'media', 'bassa'] },
      notte: { type: String, enum: ['alta', 'media', 'bassa'] }
    }
  },
  { timestamps: true }
);

crowdLevelSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('CrowdLevel', crowdLevelSchema);
