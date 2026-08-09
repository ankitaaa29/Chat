const messageService = require('../services/message.service');
const userService = require('../services/user.service');
const logger = require('../utils/logger');
const { setIO } = require('./socketManager');

// Store active connections: socketId -> { username, roomId }
const activeSockets = new Map();
// Store active usernames: username -> Set of socketIds (to handle multi-tab/device connections correctly)
const userSockets = new Map();

const broadcastOnlineUsers = async (io) => {
  try {
    const onlineUsers = await userService.getOnlineUsers();
    io.emit('online_users', onlineUsers);
  } catch (err) {
    logger.error('Error broadcasting online users:', err.message);
  }
};

const setupChatSockets = (io) => {
  setIO(io);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Event: join_room
    socket.on('join_room', async (data = {}) => {
      const { username, roomId = 'general' } = data;
      if (!username || typeof username !== 'string') return;

      const trimmedUser = username.trim();
      const trimmedRoom = roomId.trim() || 'general';

      // Clean up previous room mapping if socket was joined elsewhere
      const existing = activeSockets.get(socket.id);
      if (existing && existing.roomId !== trimmedRoom) {
        socket.leave(existing.roomId);
      }

      // Track socket metadata
      activeSockets.set(socket.id, { username: trimmedUser, roomId: trimmedRoom });

      if (!userSockets.has(trimmedUser)) {
        userSockets.set(trimmedUser, new Set());
      }
      userSockets.get(trimmedUser).add(socket.id);

      socket.join(trimmedRoom);

      // Persist user online status in database
      await userService.upsertUser(trimmedUser, true);

      logger.info(`User "${trimmedUser}" joined room "${trimmedRoom}" (socket: ${socket.id})`);

      // Notify others in the room
      socket.to(trimmedRoom).emit('user_joined', {
        username: trimmedUser,
        roomId: trimmedRoom,
        timestamp: new Date().toISOString(),
      });

      // Send current online users list to all clients
      await broadcastOnlineUsers(io);
    });

    // Event: send_message
    socket.on('send_message', async (data = {}) => {
      try {
        const { username, content, roomId = 'general' } = data;

        if (!username || !content || !content.trim()) {
          return socket.emit('error_message', { message: 'Username and content are required' });
        }

        const trimmedUser = username.trim();
        const trimmedContent = content.trim();
        const targetRoom = roomId.trim() || 'general';

        // 1. MUST Persist message to PostgreSQL DB FIRST
        const savedMessage = await messageService.createMessage({
          username: trimmedUser,
          content: trimmedContent,
          roomId: targetRoom,
        });

        // 2. Broadcast new_message to ALL connected clients in the room (including sender)
        io.to(targetRoom).emit('new_message', savedMessage);
      } catch (err) {
        logger.error('Socket send_message error:', err.message);
        socket.emit('error_message', { message: 'Failed to deliver message' });
      }
    });

    // Event: typing_start
    socket.on('typing_start', (data = {}) => {
      const { username, roomId = 'general' } = data;
      if (!username) return;
      const targetRoom = roomId.trim() || 'general';
      socket.to(targetRoom).emit('user_typing', {
        username: username.trim(),
        roomId: targetRoom,
      });
    });

    // Event: typing_stop
    socket.on('typing_stop', (data = {}) => {
      const { username, roomId = 'general' } = data;
      if (!username) return;
      const targetRoom = roomId.trim() || 'general';
      socket.to(targetRoom).emit('user_stopped_typing', {
        username: username.trim(),
        roomId: targetRoom,
      });
    });

    // Event: disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);

      const session = activeSockets.get(socket.id);
      if (session) {
        const { username, roomId } = session;
        activeSockets.delete(socket.id);

        if (userSockets.has(username)) {
          const socketsSet = userSockets.get(username);
          socketsSet.delete(socket.id);

          // If no active sockets remain for this username, set offline in DB
          if (socketsSet.size === 0) {
            userSockets.delete(username);
            await userService.setUserOffline(username);

            // Broadcast user_left and updated online_users
            socket.to(roomId).emit('user_left', {
              username,
              roomId,
              timestamp: new Date().toISOString(),
            });

            await broadcastOnlineUsers(io);
          }
        }
      }
    });
  });
};

module.exports = setupChatSockets;
