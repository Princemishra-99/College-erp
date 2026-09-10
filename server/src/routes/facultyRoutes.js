import express from 'express';
import {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getPendingFaculty,
  approveFaculty,
  revokeFacultyAccess,
} from '../controllers/facultyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Admin-only: Faculty approval management (must come before /:id to avoid conflict)
router.get('/pending-approvals', authorize('admin'), getPendingFaculty);
router.put('/:id/approve', authorize('admin'), approveFaculty);
router.put('/:id/revoke', authorize('admin'), revokeFacultyAccess);

// General routes
router.get('/', getAllFaculty);
router.get('/:id', getFacultyById);
router.post('/', authorize('admin'), createFaculty);
router.put('/:id', authorize('admin'), updateFaculty);
router.delete('/:id', authorize('admin'), deleteFaculty);

export default router;
