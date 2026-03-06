const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    posizione: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }
    },
    radiusM: { type: Number, default: 80 },
    valutazione: { type: String, enum: ['sicuro', 'buio', 'trafficato'], required: true },
    commento: { type: String, trim: true }
  },
  { timestamps: true }
);

feedbackSchema.index({ posizione: '2dsphere' });

module.exports = mongoose.model('Feedback', feedbackSchema);
