import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    // Can be email or phone number
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['registration', 'reset-password', 'change-password'],
    required: true,
  },
  // Auto-delete OTP after 10 minutes using MongoDB TTL index
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    index: { expires: 0 }, // TTL index: delete when expiresAt is reached
  },
});

// Compound index to ensure only one OTP per identifier+purpose at a time
otpSchema.index({ identifier: 1, purpose: 1 });

export const Otp = mongoose.model('Otp', otpSchema);
