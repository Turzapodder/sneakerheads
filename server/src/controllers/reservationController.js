import Reservation from '../models/Reservation.js';
import Drop from '../models/Drop.js';
import database from '../config/database.js';
import { emitStockUpdate, emitReservationCreated, emitReservationExpired, emitReservationCompleted, emitStockRecovered } from '../config/socket.js';

const { sequelize } = database;

/**
 * Create a new reservation (atomic with row-level locking)
 */
const createReservation = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: dropId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user already has an active reservation for this drop
    const existingReservation = await Reservation.findOne({
      where: {
        dropId,
        userId,
        status: 'active'
      },
      transaction
    });

    if (existingReservation) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You already have an active reservation for this item'
      });
    }

    // Lock the drop row for update to prevent race conditions
    const drop = await Drop.findByPk(dropId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!drop) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    // Check if drop is live and active
    if (drop.status !== 'live' || !drop.isActive) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This drop is not currently available for reservation'
      });
    }

    // Check available stock (this includes consideration of reserved stock)
    if (drop.availableStock < 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Out of stock'
      });
    }

    // Create the reservation with 60-second expiry
    const expiresAt = new Date(Date.now() + 60000); // 60 seconds from now
    
    const reservation = await Reservation.create({
      dropId,
      userId,
      quantity: 1,
      status: 'active',
      expiresAt
    }, { transaction });

    // Update drop stocks atomically
    await drop.increment('reservedStock', { by: 1, transaction });
    await drop.decrement('availableStock', { by: 1, transaction });

    // Reload drop to get updated values
    await drop.reload({ transaction });

    // Commit the transaction
    await transaction.commit();

    // Emit WebSocket events
    emitReservationCreated(reservation, dropId);
    emitStockUpdate(drop.id, {
      totalStock: drop.totalStock,
      availableStock: drop.availableStock,
      soldStock: drop.soldStock,
      reservedStock: drop.reservedStock
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: {
        reservation: {
          id: reservation.id,
          dropId: reservation.dropId,
          userId: reservation.userId,
          quantity: reservation.quantity,
          status: reservation.status,
          expiresAt: reservation.expiresAt,
          createdAt: reservation.createdAt
        },
        drop: {
          id: drop.id,
          availableStock: drop.availableStock,
          reservedStock: drop.reservedStock,
          soldStock: drop.soldStock
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Complete a purchase from an active reservation
 */
const completePurchase = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: reservationId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the reservation
    const reservation = await Reservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify ownership
    if (reservation.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to complete this reservation'
      });
    }

    // Check if reservation is active
    if (reservation.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot complete reservation with status: ${reservation.status}`
      });
    }

    // Check if reservation has expired
    if (new Date() > new Date(reservation.expiresAt)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Reservation has expired'
      });
    }

    // Get the drop with lock
    const drop = await Drop.findByPk(reservation.dropId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!drop) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    // Update reservation status
    await reservation.update({
      status: 'completed',
      completedAt: new Date()
    }, { transaction });

    // Update drop stocks: move from reserved to sold
    await drop.increment('soldStock', { by: reservation.quantity, transaction });
    await drop.decrement('reservedStock', { by: reservation.quantity, transaction });

    // Reload to get updated values
    await drop.reload({ transaction });

    // Commit transaction
    await transaction.commit();

    // Emit WebSocket events
    emitReservationCompleted(reservation, drop.id);
    emitStockUpdate(drop.id, {
      totalStock: drop.totalStock,
      availableStock: drop.availableStock,
      soldStock: drop.soldStock,
      reservedStock: drop.reservedStock
    });

    res.json({
      success: true,
      message: 'Purchase completed successfully',
      data: {
        reservation: {
          id: reservation.id,
          status: reservation.status,
          completedAt: reservation.completedAt
        },
        drop: {
          id: drop.id,
          availableStock: drop.availableStock,
          reservedStock: drop.reservedStock,
          soldStock: drop.soldStock
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error completing purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Cancel an active reservation
 */
const cancelReservation = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id: reservationId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the reservation
    const reservation = await Reservation.findByPk(reservationId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Verify ownership
    if (reservation.userId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this reservation'
      });
    }

    // Check if reservation is active
    if (reservation.status !== 'active') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel reservation with status: ${reservation.status}`
      });
    }

    // Get the drop with lock
    const drop = await Drop.findByPk(reservation.dropId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!drop) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    // Update reservation status
    await reservation.update({
      status: 'cancelled'
    }, { transaction });

    // Return stock to available pool
    await drop.decrement('reservedStock', { by: reservation.quantity, transaction });
    await drop.increment('availableStock', { by: reservation.quantity, transaction });

    // Reload to get updated values
    await drop.reload({ transaction });

    // Commit transaction
    await transaction.commit();

    // Emit WebSocket events
    emitStockRecovered(drop.id, {
      totalStock: drop.totalStock,
      availableStock: drop.availableStock,
      soldStock: drop.soldStock,
      reservedStock: drop.reservedStock
    });

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: {
        reservation: {
          id: reservation.id,
          status: reservation.status
        },
        drop: {
          id: drop.id,
          availableStock: drop.availableStock,
          reservedStock: drop.reservedStock,
          soldStock: drop.soldStock
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all active reservations for the authenticated user
 */
const getUserReservations = async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const reservations = await Reservation.findAll({
      where: {
        userId,
        status: 'active'
      },
      include: [{
        model: Drop,
        as: 'drop',
        attributes: ['id', 'name', 'imageUrl', 'price', 'availableStock', 'brand']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    console.error('Error getting user reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export {
  createReservation,
  completePurchase,
  cancelReservation,
  getUserReservations
};
