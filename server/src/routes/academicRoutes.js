import express from 'express';
import {
  getAllSubjects,
  createSubject,
  deleteSubject,
  getDashboardStats,
} from '../controllers/academicController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/subjects', getAllSubjects);
router.post('/subjects', authorize('admin'), createSubject);
router.delete('/subjects/:id', authorize('admin'), deleteSubject);
router.get('/dashboard-stats', authorize('admin'), getDashboardStats);

export default router;
