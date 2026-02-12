import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth.js';
import {
  createDrop,
  getAllDrops,
  getDropById,
  updateDrop,
  deleteDrop,
  getLiveDrops,
  getUpcomingDrops,
  updateStock
} from '../controllers/dropController.js';

const { requireAuth } = auth;

/**
 * @route   GET /api/drops
 * @desc    Get all drops with optional filtering
 * @query   status, category, brand, isActive, limit, offset, sortBy, sortOrder
 * @access  Public
 */
router.get('/', getAllDrops);

/**
 * @route   GET /api/drops/live
 * @desc    Get all currently live drops
 * @access  Public
 */
router.get('/live', getLiveDrops);

/**
 * @route   GET /api/drops/upcoming
 * @desc    Get all upcoming drops
 * @access  Public
 */
router.get('/upcoming', getUpcomingDrops);

/**
 * @route   GET /api/drops/:id
 * @desc    Get a single drop by ID
 * @access  Public
 */
router.get('/:id', getDropById);

/**
 * @route   POST /api/drops
 * @desc    Create a new drop
 * @access  Public (TODO: Add admin middleware in production)
 */
router.post('/', createDrop);

/**
 * @route   PUT /api/drops/:id
 * @desc    Update a drop
 * @access  Private (Admin only - add admin middleware as needed)
 */
router.put('/:id', requireAuth, updateDrop);

/**
 * @route   DELETE /api/drops/:id
 * @desc    Delete a drop (soft delete)
 * @access  Private (Admin only - add admin middleware as needed)
 */
router.delete('/:id', requireAuth, deleteDrop);

/**
 * @route   PATCH /api/drops/:id/stock
 * @desc    Update drop stock (for purchases)
 * @access  Private
 */
router.patch('/:id/stock', requireAuth, updateStock);

export default router;
