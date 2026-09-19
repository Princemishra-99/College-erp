import { Faculty } from '../models/Faculty.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';

// @desc    Get all faculty members
// @route   GET /api/faculty
// @access  Private
export const getAllFaculty = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department) query.department = department;

    const faculty = await Faculty.find(query)
      .populate('userId', 'name email avatar isActive')
      .populate('assignedSubjects', 'subjectCode subjectName semester')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get faculty by ID
// @route   GET /api/faculty/:id
// @access  Private
export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('assignedSubjects');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty record not found' });
    }

    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new faculty member
// @route   POST /api/faculty
// @access  Private (Admin)
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, employeeId, department, designation, qualification, experienceYears, phone, assignedSubjects } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingEmpId = await Faculty.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmpId) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Faculty@123',
      role: 'faculty',
    });

    const faculty = await Faculty.create({
      userId: user._id,
      employeeId: employeeId.toUpperCase(),
      department,
      designation: designation || 'Assistant Professor',
      qualification,
      experienceYears: Number(experienceYears) || 2,
      phone,
      assignedSubjects: assignedSubjects || [],
      // Admin-created faculty are auto-approved — can login immediately
      isApproved: true,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // Update subjects to reflect this faculty
    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany({ _id: { $in: assignedSubjects } }, { facultyId: faculty._id });
    }

    res.status(201).json({
      success: true,
      message: 'Faculty member created successfully',
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
// @access  Private (Admin)
export const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    const { name, department, designation, qualification, experienceYears, phone, assignedSubjects } = req.body;

    if (name) {
      await User.findByIdAndUpdate(faculty.userId, { name });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        department: department || faculty.department,
        designation: designation || faculty.designation,
        qualification: qualification || faculty.qualification,
        experienceYears: experienceYears !== undefined ? Number(experienceYears) : faculty.experienceYears,
        phone: phone || faculty.phone,
        assignedSubjects: assignedSubjects || faculty.assignedSubjects,
      },
      { new: true }
    ).populate('userId', 'name email avatar').populate('assignedSubjects');

    res.json({ success: true, message: 'Faculty updated successfully', data: updatedFaculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
// @access  Private (Admin)
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    await User.findByIdAndDelete(faculty.userId);
    await Subject.updateMany({ facultyId: faculty._id }, { $unset: { facultyId: 1 } });
    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Faculty member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Get all UNAPPROVED / pending faculty registrations ────────────────
// @route  GET /api/faculty/pending-approvals
// @access Private (Admin only)
export const getPendingFaculty = async (req, res) => {
  try {
    const pending = await Faculty.find({ isApproved: false })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Admin approves a pending faculty account ───────────────────────────
// @route  PUT /api/faculty/:id/approve
// @access Private (Admin only)
export const approveFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('userId', 'name email');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    if (faculty.isApproved) {
      return res.status(400).json({ success: false, message: 'This faculty account is already approved.' });
    }

    faculty.isApproved = true;
    faculty.approvedBy = req.user._id;
    faculty.approvedAt = new Date();
    await faculty.save();

    // Also make sure user isActive is true
    await User.findByIdAndUpdate(faculty.userId._id, { isActive: true });

    res.json({
      success: true,
      message: `Faculty account for ${faculty.userId.name} has been approved. They can now login.`,
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Admin revokes an approved faculty’s access ───────────────────────
// @route  PUT /api/faculty/:id/revoke
// @access Private (Admin only)
export const revokeFacultyAccess = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('userId', 'name email');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    if (!faculty.isApproved) {
      return res.status(400).json({ success: false, message: 'This faculty account is already unapproved.' });
    }

    faculty.isApproved = false;
    faculty.approvedBy = null;
    faculty.approvedAt = null;
    await faculty.save();

    res.json({
      success: true,
      message: `Faculty access for ${faculty.userId.name} has been revoked. They can no longer login.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @desc  Delete faculty member and cascade cleanup ─────────────────────────
// @route  DELETE /api/faculty/:id
// @access Private (Admin only)
export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Unassign subjects
    await Subject.updateMany({ facultyId: faculty._id }, { $unset: { facultyId: 1 } });

    // Delete user account
    if (faculty.userId) {
      await User.findByIdAndDelete(faculty.userId);
    }

    // Delete faculty record
    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Faculty member and associated credentials deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

