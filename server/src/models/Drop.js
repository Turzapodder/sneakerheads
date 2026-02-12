import { DataTypes } from 'sequelize';
import database from '../config/database.js';

const { sequelize } = database;

const Drop = sequelize.define('Drop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Drop name is required'
      },
      len: {
        args: [3, 255],
        msg: 'Drop name must be between 3 and 255 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'sku'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url',
    validate: {
      isUrl: {
        msg: 'Image URL must be a valid URL'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price must be a positive number'
      }
    }
  },
  totalStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_stock',
    validate: {
      min: {
        args: [0],
        msg: 'Total stock must be a non-negative integer'
      }
    }
  },
  availableStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'available_stock',
    validate: {
      min: {
        args: [0],
        msg: 'Available stock must be a non-negative integer'
      }
    }
  },
  soldStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sold_stock',
    validate: {
      min: {
        args: [0],
        msg: 'Sold stock must be a non-negative integer'
      }
    }
  },
  reservedStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'reserved_stock',
    validate: {
      min: {
        args: [0],
        msg: 'Reserved stock must be a non-negative integer'
      }
    }
  },
  dropStartTime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'drop_start_time',
    validate: {
      isDate: {
        msg: 'Drop start time must be a valid date'
      }
    }
  },
  dropEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'drop_end_time',
    validate: {
      isDate: {
        msg: 'Drop end time must be a valid date'
      },
      isAfterStart(value) {
        if (value && this.dropStartTime && new Date(value) <= new Date(this.dropStartTime)) {
          throw new Error('Drop end time must be after drop start time');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'live', 'ended', 'cancelled'),
    defaultValue: 'upcoming',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'sneakers'
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  colorway: {
    type: DataTypes.STRING,
    allowNull: true
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'release_year',
    validate: {
      min: {
        args: [1900],
        msg: 'Release year must be 1900 or later'
      },
      max: {
        args: [2100],
        msg: 'Release year must be 2100 or earlier'
      }
    }
  }
}, {
  tableName: 'drops',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['drop_start_time']
    },
    {
      fields: ['is_active']
    },
    {
      unique: true,
      fields: ['sku']
    },
    {
      fields: ['brand']
    },
    {
      fields: ['category']
    }
  ],
  hooks: {
    beforeValidate: (drop) => {
      // Auto-calculate available stock based on total, sold, and reserved
      if (drop.totalStock !== undefined) {
        const sold = drop.soldStock || 0;
        const reserved = drop.reservedStock || 0;
        drop.availableStock = drop.totalStock - sold - reserved;
      }
    },
    beforeCreate: (drop) => {
      // Initialize stocks properly
      if (drop.totalStock !== undefined) {
        drop.soldStock = drop.soldStock || 0;
        drop.reservedStock = drop.reservedStock || 0;
        drop.availableStock = drop.totalStock - drop.soldStock - drop.reservedStock;
      }
    }
  }
});

export default Drop;
