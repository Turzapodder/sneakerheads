import Drop from '../models/Drop.js';
import { Op } from 'sequelize';
import { emitStockUpdate, emitDropCreated, emitDropUpdated, emitDropDeleted } from '../config/socket.js';

/**
 * Create a new drop
 */
const createDrop = async (req, res) => {
  try {
    const {
      name,
      description,
      sku,
      imageUrl,
      price,
      totalStock,
      dropStartTime,
      dropEndTime,
      category,
      brand,
      colorway,
      releaseYear
    } = req.body;

    // Validate required fields
    if (!name || !imageUrl || !price || !totalStock || !dropStartTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, imageUrl, price, totalStock, and dropStartTime are required'
      });
    }

    // Parse and validate drop start time
    const startTime = new Date(dropStartTime);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dropStartTime format. Please provide a valid ISO 8601 date string'
      });
    }

    // Parse and validate drop end time if provided
    let endTime = null;
    if (dropEndTime) {
      endTime = new Date(dropEndTime);
      if (isNaN(endTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid dropEndTime format. Please provide a valid ISO 8601 date string'
        });
      }
      if (endTime <= startTime) {
        return res.status(400).json({
          success: false,
          message: 'Drop end time must be after drop start time'
        });
      }
    }

    // Determine initial status based on current time
    const now = new Date();
    let status = 'upcoming';
    if (startTime <= now) {
      if (endTime && endTime <= now) {
        status = 'ended';
      } else {
        status = 'live';
      }
    }

    // Create the drop
    const drop = await Drop.create({
      name,
      description,
      sku,
      imageUrl,
      price: parseFloat(price),
      totalStock: parseInt(totalStock),
      soldStock: 0,
      availableStock: parseInt(totalStock),
      dropStartTime: startTime,
      dropEndTime: endTime,
      status,
      category: category || 'sneakers',
      brand,
      colorway,
      releaseYear: releaseYear ? parseInt(releaseYear) : null
    });

    // Emit WebSocket event for real-time updates
    emitDropCreated(drop);

    res.status(201).json({
      success: true,
      message: 'Drop created successfully',
      data: drop
    });
  } catch (error) {
    console.error('Error creating drop:', error);
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'A drop with this SKU already exists'
      });
    }
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all drops with optional filtering
 */
const getAllDrops = async (req, res) => {
  try {
    const {
      status,
      category,
      brand,
      isActive,
      limit = 50,
      offset = 0,
      sortBy = 'dropStartTime',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (brand) {
      where.brand = brand;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Fetch drops with pagination
    const { count, rows: drops } = await Drop.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    res.json({
      success: true,
      data: drops,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting drops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a single drop by ID
 */
const getDropById = async (req, res) => {
  try {
    const { id } = req.params;

    const drop = await Drop.findByPk(id);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    res.json({
      success: true,
      data: drop
    });
  } catch (error) {
    console.error('Error getting drop:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update a drop
 */
const updateDrop = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const drop = await Drop.findByPk(id);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    // Validate timestamps if being updated
    if (updateData.dropStartTime) {
      const startTime = new Date(updateData.dropStartTime);
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid dropStartTime format'
        });
      }
      updateData.dropStartTime = startTime;
    }

    if (updateData.dropEndTime) {
      const endTime = new Date(updateData.dropEndTime);
      if (isNaN(endTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid dropEndTime format'
        });
      }
      updateData.dropEndTime = endTime;
    }

    await drop.update(updateData);

    // Emit WebSocket event for real-time updates
    emitDropUpdated(drop);

    res.json({
      success: true,
      message: 'Drop updated successfully',
      data: drop
    });
  } catch (error) {
    console.error('Error updating drop:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a drop (soft delete by setting isActive to false)
 */
const deleteDrop = async (req, res) => {
  try {
    const { id } = req.params;

    const drop = await Drop.findByPk(id);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    await drop.update({ isActive: false });

    // Emit WebSocket event for real-time updates
    emitDropDeleted(id);

    res.json({
      success: true,
      message: 'Drop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting drop:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get live drops (currently active)
 */
const getLiveDrops = async (req, res) => {
  try {
    const now = new Date();

    const drops = await Drop.findAll({
      where: {
        status: 'live',
        isActive: true,
        dropStartTime: {
          [Op.lte]: now
        },
        [Op.or]: [
          { dropEndTime: null },
          { dropEndTime: { [Op.gt]: now } }
        ]
      },
      order: [['dropStartTime', 'DESC']]
    });

    res.json({
      success: true,
      data: drops,
      count: drops.length
    });
  } catch (error) {
    console.error('Error getting live drops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get upcoming drops
 */
const getUpcomingDrops = async (req, res) => {
  try {
    const now = new Date();

    const drops = await Drop.findAll({
      where: {
        status: 'upcoming',
        isActive: true,
        dropStartTime: {
          [Op.gt]: now
        }
      },
      order: [['dropStartTime', 'ASC']]
    });

    res.json({
      success: true,
      data: drops,
      count: drops.length
    });
  } catch (error) {
    console.error('Error getting upcoming drops:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update drop stock (for processing purchases)
 */
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer'
      });
    }

    const drop = await Drop.findByPk(id);

    if (!drop) {
      return res.status(404).json({
        success: false,
        message: 'Drop not found'
      });
    }

    if (drop.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${drop.availableStock} units available`
      });
    }

    const newSoldStock = drop.soldStock + parseInt(quantity);
    const newAvailableStock = drop.totalStock - newSoldStock;

    await drop.update({
      soldStock: newSoldStock,
      availableStock: newAvailableStock
    });

    // Emit WebSocket event for real-time stock updates across all clients
    emitStockUpdate(drop.id, {
      totalStock: drop.totalStock,
      soldStock: newSoldStock,
      availableStock: newAvailableStock
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        id: drop.id,
        totalStock: drop.totalStock,
        soldStock: newSoldStock,
        availableStock: newAvailableStock
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  createDrop,
  getAllDrops,
  getDropById,
  updateDrop,
  deleteDrop,
  getLiveDrops,
  getUpcomingDrops,
  updateStock
};
