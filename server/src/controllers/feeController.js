import { Fee } from '../models/Fee.js';
import { Student } from '../models/Student.js';

// @desc    Get all fee records with filters
// @route   GET /api/fees
// @access  Private (Admin)
export const getAllFees = async (req, res) => {
  try {
    const { status, semester, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (semester) query.semester = Number(semester);

    const fees = await Fee.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    const filtered = department
      ? fees.filter((f) => f.studentId && f.studentId.department === department)
      : fees;

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fees for student
// @route   GET /api/fees/student/:studentId
// @access  Private
export const getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.studentId }).sort({ semester: 1 });
    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record fee payment
// @route   POST /api/fees/pay
// @access  Private (Admin & Student)
export const recordPayment = async (req, res) => {
  try {
    const { feeId, amount, paymentMode } = req.body;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const payAmount = Number(amount);
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0' });
    }

    fee.paidAmount += payAmount;
    fee.dueAmount = Math.max(0, fee.totalAmount - fee.paidAmount);
    fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : 'Partial';
    fee.paymentDate = new Date();
    fee.paymentMode = paymentMode || 'Online (UPI/Card)';
    if (!fee.receiptNo) {
      fee.receiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    }

    await fee.save();

    res.json({
      success: true,
      message: `Payment of ₹${payAmount} processed successfully. Receipt: ${fee.receiptNo}`,
      data: fee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
