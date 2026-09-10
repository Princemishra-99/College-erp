import mongoose from 'mongoose';

const markSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examType: {
      type: String,
      enum: ['MidSem1', 'MidSem2', 'EndSem', 'Internal Assessment'],
      required: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    grade: {
      type: String,
      default: 'A',
    },
  },
  {
    timestamps: true,
  }
);

// Auto calculate grade based on percentage before save
markSchema.pre('save', function (next) {
  if (this.maxMarks > 0) {
    const percentage = (this.marksObtained / this.maxMarks) * 100;
    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 50) this.grade = 'C';
    else if (percentage >= 40) this.grade = 'P';
    else this.grade = 'F';
  }
  next();
});

export const Mark = mongoose.model('Mark', markSchema);
