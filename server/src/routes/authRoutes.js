import express from 'express';
import {
  login,
  getMe,
  registerUser,
  changePassword,
  updateProfile,
  sendRegisterOTP,
  verifyAndRegister,
  sendResetOTP,
  verifyAndResetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/send-register-otp', sendRegisterOTP);
router.post('/verify-and-register', verifyAndRegister);
router.post('/send-reset-otp', sendResetOTP);
router.post('/verify-and-reset-password', verifyAndResetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin'), registerUser);
router.put('/change-password', protect, changePassword);
router.put('/profile', protect, updateProfile);

export default router;
