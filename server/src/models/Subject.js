import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
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
    credits: {
      type: Number,
      required: true,
      default: 4,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = mongoose.model('Subject', subjectSchema);
