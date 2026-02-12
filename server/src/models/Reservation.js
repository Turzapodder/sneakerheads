import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dropId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'drop_id',
    references: {
      model: 'drops',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id',
    validate: {
      notEmpty: {
        msg: 'User ID is required'
      }
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity must be at least 1'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'completed', 'expired', 'cancelled']],
        msg: 'Invalid status'
      }
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at',
    validate: {
      isDate: {
        msg: 'Expiry time must be a valid date'
      }
    }
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at',
    validate: {
      isDate: {
        msg: 'Completion time must be a valid date'
      }
    }
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['drop_id', 'user_id', 'status']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['status']
    },
    {
      fields: ['user_id']
    }
  ],
  hooks: {
    beforeCreate: (reservation) => {
      // Set expiry time to 60 seconds from now if not provided
      if (!reservation.expiresAt) {
        const now = new Date();
        reservation.expiresAt = new Date(now.getTime() + 60000); // 60 seconds
      }
    }
  }
});

export default Reservation;
