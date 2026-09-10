import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide notice title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide notice content'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      enum: ['all', 'student', 'faculty'],
      default: 'all',
    },
    category: {
      type: String,
      enum: ['General', 'Exam', 'Academic', 'Fee', 'Holiday', 'Placement'],
      default: 'General',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Notice = mongoose.model('Notice', noticeSchema);
