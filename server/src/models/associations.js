import Drop from './Drop.js';
import Reservation from './Reservation.js';
import User from './User.js';
import Purchase from './Purchase.js';

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

  // Purchase belongs to Drop
  Purchase.belongsTo(Drop, {
    foreignKey: 'dropId',
    as: 'drop',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Drop has many Purchases
  Drop.hasMany(Purchase, {
    foreignKey: 'dropId',
    as: 'purchases'
  });

  // Purchase belongs to User
  Purchase.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'clerkId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // User has many Purchases
  User.hasMany(Purchase, {
    foreignKey: 'userId',
    sourceKey: 'clerkId',
    as: 'purchases'
  });

  // Purchase belongs to Reservation (optional)
  Purchase.belongsTo(Reservation, {
    foreignKey: 'reservationId',
    as: 'reservation',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  console.log('Model associations configured');
};

export default setupAssociations;
