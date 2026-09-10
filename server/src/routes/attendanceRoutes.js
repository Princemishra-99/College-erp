import express from 'express';
import {
  markAttendance,
  getAttendanceBySubjectAndDate,
  getStudentAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/mark', authorize('admin', 'faculty'), markAttendance);
router.get('/by-subject-date', getAttendanceBySubjectAndDate);
router.get('/student/:studentId', getStudentAttendanceReport);

export default router;
