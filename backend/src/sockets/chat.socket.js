const messageService = require('../services/message.service');
const userService = require('../services/user.service');
const logger = require('../utils/logger');
const { setIO } = require('./socketManager');
const { verifyToken } = require('../middleware/auth.middleware');

// Store active connections: socketId -> { username, roomId }
const activeSockets = new Map();
// Store active usernames: username -> Set of socketIds
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

  // Optional Socket Middleware: Authenticate connections if auth token is present
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.user = decoded;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} ${socket.user ? `(Authenticated user: ${socket.user.username})` : ''}`);

    // Event: join_room
    socket.on('join_room', async (data = {}) => {
      const username = socket.user ? socket.user.username : data.username;
      const roomId = data.roomId || 'general';

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
        const username = socket.user ? socket.user.username : data.username;
        const { content, mediaUrl, mediaType, roomId = 'general' } = data;

        if (!username || (!content && !mediaUrl)) {
          return socket.emit('error_message', { message: 'Username and content or media are required' });
        }

        const trimmedUser = username.trim();
        const trimmedContent = content ? content.trim() : '';
        const targetRoom = roomId.trim() || 'general';

        // 1. MUST Persist message to PostgreSQL DB FIRST
        const savedMessage = await messageService.createMessage({
          username: trimmedUser,
          content: trimmedContent,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
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
      const username = socket.user ? socket.user.username : data.username;
      const roomId = data.roomId || 'general';
      if (!username) return;
      const targetRoom = roomId.trim() || 'general';
      socket.to(targetRoom).emit('user_typing', {
        username: username.trim(),
        roomId: targetRoom,
      });
    });

    // Event: typing_stop
    socket.on('typing_stop', (data = {}) => {
      const username = socket.user ? socket.user.username : data.username;
      const roomId = data.roomId || 'general';
      if (!username) return;
      const targetRoom = roomId.trim() || 'general';
      socket.to(targetRoom).emit('user_stopped_typing', {
        username: username.trim(),
        roomId: targetRoom,
      });
    });

    // -------------------------------------------------------------
    // WEBRTC VOICE & VIDEO CALL SIGNALING EVENTS
    // -------------------------------------------------------------

    // 1. Initiate WebRTC Call
    socket.on('call_user', (data = {}) => {
      const { userToCall, offer, callType = 'video', roomId = 'general' } = data;
      const callerName = socket.user ? socket.user.username : data.callerName;

      logger.info(`WebRTC Call Initiated from "${callerName}" to "${userToCall || 'room'}" (${callType})`);

      if (userToCall && userSockets.has(userToCall)) {
        const targetSockets = userSockets.get(userToCall);
        targetSockets.forEach((targetSocketId) => {
          io.to(targetSocketId).emit('incoming_call', {
            from: socket.id,
            callerName,
            offer,
            callType,
            roomId,
          });
        });
      } else {
        // Broadcast to channel members except caller
        socket.to(roomId).emit('incoming_call', {
          from: socket.id,
          callerName,
          offer,
          callType,
          roomId,
        });
      }
    });

    // 2. Answer Incoming Call
    socket.on('answer_call', (data = {}) => {
      const { to, answer } = data;
      logger.info(`WebRTC Call Answered by socket: ${socket.id} -> sending answer to ${to}`);
      io.to(to).emit('call_accepted', {
        from: socket.id,
        answer,
      });
    });

    // 3. Exchange ICE Candidates
    socket.on('ice_candidate', (data = {}) => {
      const { to, candidate } = data;
      if (to && candidate) {
        io.to(to).emit('ice_candidate', {
          from: socket.id,
          candidate,
        });
      }
    });

    // 4. End Call / Hang Up
    socket.on('end_call', (data = {}) => {
      const { to, roomId } = data;
      if (to) {
        io.to(to).emit('call_ended', { from: socket.id });
      } else if (roomId) {
        socket.to(roomId).emit('call_ended', { from: socket.id });
      }
    });

    // 5. Reject Call
    socket.on('reject_call', (data = {}) => {
      const { to } = data;
      if (to) {
        io.to(to).emit('call_rejected', { from: socket.id });
      }
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
