const mongoose = require('mongoose');

const safeZoneSchema = new mongoose.Schema(
  {
    operatoreId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    area: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], required: true }
    },
    livelloRischio: { type: String, enum: ['basso', 'medio', 'alto'], required: true },
    colore: { type: String, default: '#1d9e75' },
    fattoriRischio: { type: [String], default: [] }
  },
  { timestamps: true }
);

safeZoneSchema.index({ area: '2dsphere' });

module.exports = mongoose.model('SafeZone', safeZoneSchema);
