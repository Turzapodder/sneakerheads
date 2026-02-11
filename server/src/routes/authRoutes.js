const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { syncUser } = require('../middlewares/syncUser');
const {
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getAllUsers
} = require('../controllers/authController');

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

module.exports = router;
