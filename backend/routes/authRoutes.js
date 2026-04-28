import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, verifyOTPHandler, resendOTP, forgotPassword, resetPassword, getProfile, updateProfile, changePassword, refreshTokenHandler } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts, try after 15 minutes' } });

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/verify-otp', verifyOTPHandler);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshTokenHandler);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
