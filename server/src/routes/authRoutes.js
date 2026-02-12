import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth.js';
import syncUserMiddleware from '../middlewares/syncUser.js';
import {
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getAllUsers
} from '../controllers/authController.js';

const { requireAuth } = auth;
const { syncUser } = syncUserMiddleware;

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(syncUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', deleteAccount);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/users', getAllUsers);

export default router;
