import express from 'express';
import auth from '../middlewares/auth.js';
import {
  createReservation,
  completePurchase,
  cancelReservation,
  getUserReservations
} from '../controllers/reservationController.js';

const { requireAuth } = auth;

const router = express.Router();

/**
 * @route   POST /api/drops/:id/reserve
 * @desc    Create a new reservation for a drop
 * @access  Private (requires authentication)
 */
router.post('/drops/:id/reserve', requireAuth, createReservation);

/**
 * @route   POST /api/reservations/:id/purchase
 * @desc    Complete a purchase from an active reservation
 * @access  Private (requires authentication)
 */
router.post('/reservations/:id/purchase', requireAuth, completePurchase);

/**
 * @route   DELETE /api/reservations/:id/cancel
 * @desc    Cancel an active reservation
 * @access  Private (requires authentication)
 */
router.delete('/reservations/:id/cancel', requireAuth, cancelReservation);

/**
 * @route   GET /api/reservations/my-reservations
 * @desc    Get all active reservations for the authenticated user
 * @access  Private (requires authentication)
 */
router.get('/reservations/my-reservations', requireAuth, getUserReservations);

export default router;
