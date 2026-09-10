import { Subject } from '../models/Subject.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Fee } from '../models/Fee.js';

// @desc    Get all subjects with optional filters
// @route   GET /api/academics/subjects
// @access  Private
export const getAllSubjects = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    const subjects = await Subject.find(query).populate('facultyId').sort({ semester: 1, subjectCode: 1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create subject
// @route   POST /api/academics/subjects
// @access  Private (Admin)
export const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, department, semester, credits, facultyId } = req.body;

    const exists = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Subject code already exists' });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      department,
      semester: Number(semester),
      credits: Number(credits) || 4,
      facultyId: facultyId || null,
    });

    if (facultyId) {
      await Faculty.findByIdAndUpdate(facultyId, { $addToSet: { assignedSubjects: subject._id } });
    }

    res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete subject
// @route   DELETE /api/academics/subjects/:id
// @access  Private (Admin)
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Faculty.updateMany({ assignedSubjects: subject._id }, { $pull: { assignedSubjects: subject._id } });
    await Subject.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get overall admin dashboard statistics
// @route   GET /api/academics/dashboard-stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    // Fee aggregation
    const feeTotals = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalExpected: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
        },
      },
    ]);

    // Student distribution by department
    const deptDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalSubjects,
        fees: feeTotals[0] || { totalExpected: 0, totalCollected: 0, totalDue: 0 },
        deptDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
