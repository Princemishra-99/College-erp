import express from 'express';
import {
  saveBatchMarks,
  getStudentMarks,
  getMarksBySubjectAndExam,
} from '../controllers/marksController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/batch', authorize('admin', 'faculty'), saveBatchMarks);
router.get('/student/:studentId', getStudentMarks);
router.get('/by-subject-exam', authorize('admin', 'faculty'), getMarksBySubjectAndExam);

export default router;
