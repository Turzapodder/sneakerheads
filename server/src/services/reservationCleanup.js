import Reservation from '../models/Reservation.js';
import Drop from '../models/Drop.js';
import database from '../config/database.js';
import { emitReservationExpired, emitStockRecovered } from '../config/socket.js';

const { sequelize } = database;

let cleanupInterval = null;

/**
 * Clean up expired reservations and return stock to available pool
 */
const cleanupExpiredReservations = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    const now = new Date();

    // Find all active reservations that have expired
    const expiredReservations = await Reservation.findAll({
      where: {
        status: 'active',
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: now
        }
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (expiredReservations.length === 0) {
      await transaction.commit();
      return;
    }

    console.log(`🧹 Cleaning up ${expiredReservations.length} expired reservation(s)...`);

    // Process each expired reservation
    for (const reservation of expiredReservations) {
      try {
        // Get the associated drop with lock
        const drop = await Drop.findByPk(reservation.dropId, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (drop) {
          // Update reservation status to expired
          await reservation.update({
            status: 'expired'
          }, { transaction });

          // Return stock to available pool
          await drop.decrement('reservedStock', { by: reservation.quantity, transaction });
          await drop.increment('availableStock', { by: reservation.quantity, transaction });

          // Reload to get updated values
          await drop.reload({ transaction });

          console.log(`✅ Expired reservation ${reservation.id} for drop ${drop.name}`);

          // Emit WebSocket events (after commit)
          // We'll collect these and emit after commit
          setImmediate(() => {
            emitReservationExpired(reservation, drop.id);
            emitStockRecovered(drop.id, {
              totalStock: drop.totalStock,
              availableStock: drop.availableStock,
              soldStock: drop.soldStock,
              reservedStock: drop.reservedStock
            });
          });
        } else {
          // Drop not found, just mark as expired
          await reservation.update({
            status: 'expired'
          }, { transaction });
          
          console.warn(`⚠️ Drop ${reservation.dropId} not found for expired reservation ${reservation.id}`);
        }
      } catch (err) {
        console.error(`Error processing expired reservation ${reservation.id}:`, err);
        // Continue with other reservations
      }
    }

    await transaction.commit();
    console.log(`✅ Cleanup completed for ${expiredReservations.length} reservation(s)`);
  } catch (error) {
    await transaction.rollback();
    console.error('Error in cleanup process:', error);
  }
};

/**
 * Start the periodic cleanup scheduler
 * Runs every 5 seconds to check for expired reservations
 */
const startCleanupScheduler = () => {
  if (cleanupInterval) {
    console.warn('⚠️ Cleanup scheduler already running');
    return;
  }

  console.log('🚀 Starting reservation cleanup scheduler (runs every 5 seconds)...');
  
  // Run immediately on start
  cleanupExpiredReservations();
  
  // Then run every 5 seconds
  cleanupInterval = setInterval(async () => {
    await cleanupExpiredReservations();
  }, 5000); // 5 seconds
};

/**
 * Stop the cleanup scheduler
 * Called on server shutdown
 */
const stopCleanupScheduler = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('🛑 Reservation cleanup scheduler stopped');
  }
};

export {
  cleanupExpiredReservations,
  startCleanupScheduler,
  stopCleanupScheduler
};
