import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';
import { Subject } from '../models/Subject.js';

// @desc    Mark attendance for multiple students (batch)
// @route   POST /api/attendance/mark
// @access  Private (Faculty & Admin)
export const markAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;
    // records: [ { studentId, status: 'Present' | 'Absent', remarks } ]

    if (!subjectId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide subjectId, date, and records array' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const facultyId = req.user.role === 'faculty' && req.user.profile ? req.user.profile._id : req.body.facultyId;

    const operations = records.map((rec) => ({
      updateOne: {
        filter: {
          studentId: rec.studentId,
          subjectId,
          date: attendanceDate,
        },
        update: {
          $set: {
            facultyId: facultyId || null,
            status: rec.status || 'Present',
            remarks: rec.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    res.json({
      success: true,
      message: `Attendance recorded successfully for ${records.length} students on ${attendanceDate.toISOString().split('T')[0]}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance for a specific subject & date
// @route   GET /api/attendance/by-subject-date
// @access  Private
export const getAttendanceBySubjectAndDate = async (req, res) => {
  try {
    const { subjectId, date } = req.query;

    if (!subjectId || !date) {
      return res.status(400).json({ success: false, message: 'Please specify subjectId and date' });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const records = await Attendance.find({
      subjectId,
      date: { $gte: targetDate, $lt: nextDate },
    }).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' },
    });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get comprehensive attendance report for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private
export const getStudentAttendanceReport = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get all subjects of student's current semester & department
    const subjects = await Subject.find({ department: student.department, semester: student.semester });

    const subjectReports = [];
    let overallAttended = 0;
    let overallTotal = 0;

    for (const sub of subjects) {
      const total = await Attendance.countDocuments({ studentId: student._id, subjectId: sub._id });
      const attended = await Attendance.countDocuments({ studentId: student._id, subjectId: sub._id, status: 'Present' });
      const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : '100.0';

      overallAttended += attended;
      overallTotal += total;

      subjectReports.push({
        subjectId: sub._id,
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        totalClasses: total,
        attendedClasses: attended,
        percentage: Number(percentage),
        isDefaulter: Number(percentage) < 75,
      });
    }

    const overallPercentage = overallTotal > 0 ? ((overallAttended / overallTotal) * 100).toFixed(1) : '100.0';

    res.json({
      success: true,
      data: {
        studentId: student._id,
        enrollmentNo: student.enrollmentNo,
        overallStats: {
          totalClasses: overallTotal,
          attendedClasses: overallAttended,
          percentage: Number(overallPercentage),
          isDefaulter: Number(overallPercentage) < 75,
        },
        subjects: subjectReports,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
