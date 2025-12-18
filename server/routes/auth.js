import express from 'express';
import { register, login, verifyOtp, forgotPassword, resetPassword } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
