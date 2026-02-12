import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clerkId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'clerk_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'last_name'
  },
  profileImageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'profile_image_url'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['clerk_id']
    },
    {
      unique: true,
      fields: ['email']
    }
  ]
});

export default User;
