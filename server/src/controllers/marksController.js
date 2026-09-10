import { Mark } from '../models/Mark.js';
import { Student } from '../models/Student.js';

// @desc    Add or update marks (batch)
// @route   POST /api/marks/batch
// @access  Private (Faculty & Admin)
export const saveBatchMarks = async (req, res) => {
  try {
    const { subjectId, examType, maxMarks, marksData } = req.body;
    // marksData: [ { studentId, marksObtained } ]

    if (!subjectId || !examType || !marksData || !Array.isArray(marksData)) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const operations = marksData.map((item) => {
      const percentage = (item.marksObtained / (maxMarks || 100)) * 100;
      let grade = 'A';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'P';
      else grade = 'F';

      return {
        updateOne: {
          filter: {
            studentId: item.studentId,
            subjectId,
            examType,
          },
          update: {
            $set: {
              marksObtained: Number(item.marksObtained),
              maxMarks: Number(maxMarks) || 100,
              grade,
            },
          },
          upsert: true,
        },
      };
    });

    await Mark.bulkWrite(operations);

    res.json({
      success: true,
      message: `Marks successfully saved for ${marksData.length} students`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get marks for student
// @route   GET /api/marks/student/:studentId
// @access  Private
export const getStudentMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.params.studentId })
      .populate('subjectId', 'subjectCode subjectName credits semester')
      .sort({ createdAt: -1 });

    const student = await Student.findById(req.params.studentId).populate('userId', 'name email');

    res.json({
      success: true,
      student,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get marks by subject & exam
// @route   GET /api/marks/by-subject-exam
// @access  Private (Faculty & Admin)
export const getMarksBySubjectAndExam = async (req, res) => {
  try {
    const { subjectId, examType } = req.query;
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'Please provide subjectId' });
    }

    const query = { subjectId };
    if (examType) query.examType = examType;

    const marks = await Mark.find(query).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' },
    });

    res.json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
