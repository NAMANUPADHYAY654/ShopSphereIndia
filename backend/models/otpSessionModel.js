const mongoose = require('mongoose');

const otpSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  purpose: {
    type: String,
    enum: ['login', 'register'],
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email',
  },
  destination: {
    type: String,
    required: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  consumed: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
}, {
  timestamps: true,
});

const OtpSession = mongoose.model('OtpSession', otpSessionSchema);

module.exports = OtpSession;