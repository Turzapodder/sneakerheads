import Drop from './Drop.js';
import Reservation from './Reservation.js';

/**
 * Define model associations/relationships
 */
const setupAssociations = () => {
  // Reservation belongs to Drop
  Reservation.belongsTo(Drop, {
    foreignKey: 'dropId',
    as: 'drop',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Drop has many Reservations
  Drop.hasMany(Reservation, {
    foreignKey: 'dropId',
    as: 'reservations'
  });

  console.log('✅ Model associations configured');
};

export default setupAssociations;
