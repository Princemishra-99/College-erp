import express from 'express';
import { getAllNotices, createNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllNotices);
router.post('/', authorize('admin', 'faculty'), createNotice);
router.delete('/:id', authorize('admin'), deleteNotice);

export default router;
