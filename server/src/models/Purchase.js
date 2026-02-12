import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

/**
 * Purchase model - tracks completed purchases
 */
const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dropId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'drops',
      key: 'id'
    },
    field: 'drop_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id'
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'reservations',
      key: 'id'
    },
    field: 'reservation_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_at_purchase'
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'purchased_at'
  }
}, {
  tableName: 'purchases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['drop_id', 'purchased_at']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['reservation_id']
    }
  ]
});

export default Purchase;
