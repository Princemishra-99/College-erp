import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentNo: {
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
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      required: true,
      default: 'A',
      uppercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    guardianName: {
      type: String,
      required: true,
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    address: {
      type: String,
      default: '',
    },
    batchYear: {
      type: String,
      default: '2023-2027',
    },
  },
  {
    timestamps: true,
  }
);

export const Student = mongoose.model('Student', studentSchema);
