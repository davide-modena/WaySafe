const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema(
  {
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    tipo: { type: String, enum: ['furto', 'aggressione', 'vandalismo', 'altro'], default: 'altro' },
    data: { type: Date, required: true },
    count: { type: Number, default: 1 }
  },
  { timestamps: true }
);

interventionSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Intervention', interventionSchema);
