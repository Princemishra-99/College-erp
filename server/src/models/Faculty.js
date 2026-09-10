import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Computer Science & Engg', 'Information Technology', 'Electronics & Comm', 'Mechanical Engg', 'Civil Engg'],
    },
    designation: {
      type: String,
      required: true,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Head of Department', 'Lecturer'],
      default: 'Assistant Professor',
    },
    qualification: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      default: 3,
    },
    phone: {
      type: String,
      required: true,
    },
    assignedSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    // Admin must approve before faculty can login
    isApproved: {
      type: Boolean,
      default: false, // New self-registrations start unapproved
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Faculty = mongoose.model('Faculty', facultySchema);
