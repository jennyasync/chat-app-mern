import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiters.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateDeleteAccount,
} from '../validators/auth.validator.js';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, register);

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, login);

// GET /api/auth/me
router.get('/me', protect, getMe);

// PATCH /api/auth/profile
router.patch('/profile', protect, validateUpdateProfile, updateProfile);

// PATCH /api/auth/password
router.patch('/password', protect, validateChangePassword, changePassword);

// DELETE /api/auth/account
router.delete('/account', protect, validateDeleteAccount, deleteAccount);

export default router;
