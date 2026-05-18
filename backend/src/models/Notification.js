const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: {
      type: String,
      enum: ['segnalazione', 'messaggio', 'avviso'],
      default: 'segnalazione'
    },
    titolo: { type: String, required: true },
    messaggio: { type: String, required: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    letta: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
