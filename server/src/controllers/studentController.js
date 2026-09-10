import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { Attendance } from '../models/Attendance.js';
import { Mark } from '../models/Mark.js';
import { Fee } from '../models/Fee.js';
import { ProfileRequest } from '../models/ProfileRequest.js';

// @desc    Get all students with filters & pagination
// @route   GET /api/students
// @access  Private (Admin & Faculty)
export const getAllStudents = async (req, res) => {
  try {
    const { department, semester, search } = req.query;
    const query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    let students = await Student.find(query)
      .populate('userId', 'name email avatar isActive')
      .sort({ enrollmentNo: 1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      students = students.filter(
        (s) =>
          (s.userId && s.userId.name && s.userId.name.match(searchRegex)) ||
          s.enrollmentNo.match(searchRegex) ||
          (s.phone && s.phone.match(searchRegex))
      );
    }

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student details with complete academic profile
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email avatar isActive');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Attendance summary
    const totalClasses = await Attendance.countDocuments({ studentId: student._id });
    const attendedClasses = await Attendance.countDocuments({ studentId: student._id, status: 'Present' });
    const attendancePercentage = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : 0;

    // Marks summary
    const marks = await Mark.find({ studentId: student._id }).populate('subjectId', 'subjectCode subjectName credits');

    // Fee summary
    const feeRecords = await Fee.find({ studentId: student._id }).sort({ semester: 1 });

    res.json({
      success: true,
      data: {
        student,
        academicSummary: {
          totalClasses,
          attendedClasses,
          attendancePercentage: Number(attendancePercentage),
          marks,
          feeRecords,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new student and auth account
// @route   POST /api/students
// @access  Private (Admin)
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      enrollmentNo,
      department,
      semester,
      section,
      phone,
      guardianName,
      guardianPhone,
      address,
      gender,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingEnrollment = await Student.findOne({ enrollmentNo: enrollmentNo.toUpperCase() });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Enrollment number already exists' });
    }

    // Create User account
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Student@123',
      role: 'student',
    });

    // Create Student profile
    const student = await Student.create({
      userId: user._id,
      enrollmentNo: enrollmentNo.toUpperCase(),
      department,
      semester: Number(semester) || 1,
      section: (section || 'A').toUpperCase(),
      phone,
      guardianName,
      guardianPhone: guardianPhone || '',
      address: address || '',
      gender: gender || 'Male',
    });

    // Create default Fee record for current semester
    await Fee.create({
      studentId: student._id,
      semester: student.semester,
      totalAmount: 45000,
      paidAmount: 0,
      dueAmount: 45000,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin)
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { name, department, semester, section, phone, guardianName, guardianPhone, address } = req.body;

    if (name) {
      await User.findByIdAndUpdate(student.userId, { name });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        department: department || student.department,
        semester: semester !== undefined ? Number(semester) : student.semester,
        section: section ? section.toUpperCase() : student.section,
        phone: phone || student.phone,
        guardianName: guardianName || student.guardianName,
        guardianPhone: guardianPhone !== undefined ? guardianPhone : student.guardianPhone,
        address: address !== undefined ? address : student.address,
      },
      { new: true }
    ).populate('userId', 'name email avatar');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student & user
// @route   DELETE /api/students/:id
// @access  Private (Admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.userId);
    await Attendance.deleteMany({ studentId: student._id });
    await Mark.deleteMany({ studentId: student._id });
    await Fee.deleteMany({ studentId: student._id });
    await Student.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Student submits a profile update request ──────────────────────────
// @route  POST /api/students/request-update
// @access Private (Student only)
export const submitProfileRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Anti-spam: only 1 pending request at a time
    const existingPending = await ProfileRequest.findOne({ studentId: student._id, status: 'Pending' });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending profile update request. Please wait for Faculty/Admin to review it before submitting a new one.',
      });
    }

    const { name, phone, address, guardianName, guardianPhone, gender, dob, reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a clear reason for the update request (minimum 5 characters).' });
    }

    // Snapshot of current values
    const currentData = {
      name: student.userId.name,
      phone: student.phone,
      address: student.address,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      gender: student.gender,
      dob: student.dob,
    };

    const requestedData = {
      name: name || student.userId.name,
      phone: phone || student.phone,
      address: address !== undefined ? address : student.address,
      guardianName: guardianName || student.guardianName,
      guardianPhone: guardianPhone !== undefined ? guardianPhone : student.guardianPhone,
      gender: gender || student.gender,
      dob: dob || student.dob,
    };

    const profileRequest = await ProfileRequest.create({
      studentId: student._id,
      userId: req.user._id,
      currentData,
      requestedData,
      reason: reason.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Profile update request submitted successfully. It will be reviewed by your Faculty or Admin.',
      data: profileRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Student checks their own pending request status ───────────────────
// @route  GET /api/students/my-request
// @access Private (Student)
export const getMyProfileRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const request = await ProfileRequest.findOne({ studentId: student._id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Admin / Faculty view all profile update requests ──────────────────
// @route  GET /api/students/update-requests
// @access Private (Admin, Faculty)
export const getProfileRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const requests = await ProfileRequest.find(query)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Admin / Faculty approve or reject a profile request ───────────────
// @route  PUT /api/students/update-requests/:requestId
// @access Private (Admin, Faculty)
export const reviewProfileRequest = async (req, res) => {
  try {
    const { action, reviewRemarks } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const request = await ProfileRequest.findById(req.params.requestId).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Profile update request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status.toLowerCase()}.` });
    }

    request.status = action === 'approve' ? 'Approved' : 'Rejected';
    request.reviewedBy = req.user._id;
    request.reviewRemarks = reviewRemarks || '';
    request.reviewedAt = new Date();
    await request.save();

    if (action === 'approve') {
      const { name, phone, address, guardianName, guardianPhone, gender, dob } = request.requestedData;

      // Update User name if requested
      if (name) {
        await User.findByIdAndUpdate(request.userId, { name });
      }

      // Update Student profile
      await Student.findByIdAndUpdate(request.studentId._id, {
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(guardianName && { guardianName }),
        ...(guardianPhone !== undefined && { guardianPhone }),
        ...(gender && { gender }),
        ...(dob && { dob }),
      });
    }

    const actionLabel = action === 'approve' ? 'approved and profile updated' : 'rejected';
    res.json({
      success: true,
      message: `Profile update request ${actionLabel} successfully.`,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
