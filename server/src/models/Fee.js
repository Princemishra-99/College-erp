import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 45000,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 45000,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
    receiptNo: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentMode: {
      type: String,
      enum: ['Online (UPI/Card)', 'Bank Demand Draft', 'Cash', 'Net Banking'],
      default: 'Online (UPI/Card)',
    },
  },
  {
    timestamps: true,
  }
);

feeSchema.pre('save', function (next) {
  this.dueAmount = Math.max(0, this.totalAmount - this.paidAmount);
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'Paid';
  } else if (this.paidAmount > 0) {
    this.status = 'Partial';
  } else {
    this.status = 'Pending';
  }
  next();
});

export const Fee = mongoose.model('Fee', feeSchema);
