import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  submitProfileRequest,
  getMyProfileRequest,
  getProfileRequests,
  reviewProfileRequest,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Profile update request routes (must come before /:id)
router.post('/request-update', authorize('student'), submitProfileRequest);
router.get('/my-request', authorize('student'), getMyProfileRequest);
router.get('/update-requests', authorize('admin', 'faculty'), getProfileRequests);
router.put('/update-requests/:requestId', authorize('admin', 'faculty'), reviewProfileRequest);

// Main CRUD routes
router.get('/', authorize('admin', 'faculty'), getAllStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin', 'faculty'), updateStudent);  // Faculty can also edit students
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
