import express from 'express';
import { getAllFees, getStudentFees, recordPayment } from '../controllers/feeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllFees);
router.get('/student/:studentId', getStudentFees);
router.post('/pay', recordPayment);

export default router;
