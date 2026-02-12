import { Server } from 'socket.io';

let io;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        process.env.CLIENT_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join a specific drop room for targeted updates
    socket.on('join-drop', (dropId) => {
      socket.join(`drop-${dropId}`);
      console.log(`📦 Client ${socket.id} joined drop room: ${dropId}`);
    });

    // Leave a drop room
    socket.on('leave-drop', (dropId) => {
      socket.leave(`drop-${dropId}`);
      console.log(`👋 Client ${socket.id} left drop room: ${dropId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit stock update to all connected clients
 */
export const emitStockUpdate = (dropId, stockData) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping stock update emission');
    return;
  }

  const updatePayload = {
    dropId,
    totalStock: stockData.totalStock,
    availableStock: stockData.availableStock,
    soldStock: stockData.soldStock,
    timestamp: new Date().toISOString()
  };

  // Emit to all clients
  io.emit('stock-updated', updatePayload);

  // Also emit to specific drop room
  io.to(`drop-${dropId}`).emit('drop-stock-updated', updatePayload);

  console.log(`📊 Stock update emitted for drop ${dropId}:`, updatePayload);
};

/**
 * Emit drop creation event
 */
export const emitDropCreated = (drop) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping drop creation emission');
    return;
  }

  io.emit('drop-created', {
    drop,
    timestamp: new Date().toISOString()
  });

  console.log(`🆕 Drop created event emitted:`, drop.id);
};

/**
 * Emit drop update event
 */
export const emitDropUpdated = (drop) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping drop update emission');
    return;
  }

  io.emit('drop-updated', {
    drop,
    timestamp: new Date().toISOString()
  });

  io.to(`drop-${drop.id}`).emit('drop-data-updated', {
    drop,
    timestamp: new Date().toISOString()
  });

  console.log(`🔄 Drop updated event emitted:`, drop.id);
};

/**
 * Emit drop deletion event
 */
export const emitDropDeleted = (dropId) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping drop deletion emission');
    return;
  }

  io.emit('drop-deleted', {
    dropId,
    timestamp: new Date().toISOString()
  });

  console.log(`🗑️ Drop deleted event emitted:`, dropId);
};

export default {
  initializeSocket,
  getIO,
  emitStockUpdate,
  emitDropCreated,
  emitDropUpdated,
  emitDropDeleted
};
