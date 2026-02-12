import User from '../models/User.js';
import { clerkClient } from '@clerk/clerk-sdk-node';

/**
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        id: req.user.id,
        clerkId: req.user.clerkId,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl,
        role: req.user.role,
        isActive: req.user.isActive,
        lastLoginAt: req.user.lastLoginAt,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { firstName, lastName, profileImageUrl } = req.body;

    // Update in database
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      profileImageUrl: profileImageUrl || req.user.profileImageUrl
    });

    // Optionally update in Clerk as well
    try {
      // Note: Clerk SDK might not support updating profile image directly via this method without a file token
      // We'll focus on database update which is our source of truth
      await clerkClient.users.updateUser(req.user.clerkId, {
        firstName: firstName || undefined,
        lastName: lastName || undefined
      });
    } catch (clerkError) {
      console.error('Error updating Clerk user:', clerkError);
      // Continue even if Clerk update fails
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete user account
 */
const deleteAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const clerkId = req.user.clerkId;

    // Soft delete in database
    await req.user.update({ isActive: false });

    // Optionally delete from Clerk
    try {
      await clerkClient.users.deleteUser(clerkId);
    } catch (clerkError) {
      console.error('Error deleting Clerk user:', clerkError);
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin access required'
      });
    }

    const users = await User.findAll({
      attributes: ['id', 'clerkId', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  getCurrentUser,
  updateProfile,
  deleteAccount,
  getAllUsers
};
