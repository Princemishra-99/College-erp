import mongoose from 'mongoose';

const profileRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Snapshot of current values at time of request
    currentData: {
      name: String,
      phone: String,
      address: String,
      guardianName: String,
      guardianPhone: String,
      gender: String,
      dob: Date,
    },
    // What the student wants to change to
    requestedData: {
      name: String,
      phone: String,
      address: String,
      guardianName: String,
      guardianPhone: String,
      gender: String,
      dob: Date,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for update request'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    // Admin or Faculty who reviewed this request
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewRemarks: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ProfileRequest = mongoose.model('ProfileRequest', profileRequestSchema);
