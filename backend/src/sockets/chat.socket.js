const messageService = require('../services/message.service');
const conversationService = require('../services/conversation.service');
const userService = require('../services/user.service');
const contactService = require('../services/contact.service');
const logger = require('../utils/logger');
const { setIO } = require('./socketManager');
const { verifyToken } = require('../middleware/auth.middleware');

const activeSockets = new Map();
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

    if (socket.user && socket.user.id) {
      socket.join(`user:${socket.user.id}`);
    }

    // Event: register_user
    socket.on('register_user', async (data = {}) => {
      const username = socket.user ? socket.user.username : data.username;
      const userId = socket.user ? socket.user.id : data.userId;

      if (!username) return;

      const trimmedUser = username.trim();
      activeSockets.set(socket.id, { username: trimmedUser, userId });

      if (!userSockets.has(trimmedUser)) {
        userSockets.set(trimmedUser, new Set());
      }
      userSockets.get(trimmedUser).add(socket.id);

      if (userId) {
        socket.join(`user:${userId}`);
      }

      await userService.upsertUser(trimmedUser, true);
      await broadcastOnlineUsers(io);
    });

    // Event: join_conversation (Strict 1-to-1 conversation room authorization)
    socket.on('join_conversation', async (data = {}) => {
      const { conversationId } = data;
      const userId = socket.user ? socket.user.id : data.userId;

      if (!conversationId || !userId) {
        return socket.emit('message_error', { message: 'conversationId and userId are required' });
      }

      try {
        // Verify user is a participant in this conversation
        const messages = await conversationService.getConversationMessages(userId, conversationId, 1);
        socket.join(`conversation:${conversationId}`);
        logger.info(`User ${userId} joined conversation socket room: conversation:${conversationId}`);
      } catch (err) {
        logger.warn(`Rejected socket join for user ${userId} to conversation ${conversationId}: ${err.message}`);
        socket.emit('message_error', { message: err.message || 'Unauthorized conversation room access' });
      }
    });

    // Event: leave_conversation
    socket.on('leave_conversation', (data = {}) => {
      const { conversationId } = data;
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Event: send_message (1-to-1 private conversation message)
    socket.on('send_message', async (data = {}) => {
      try {
        const userId = socket.user ? socket.user.id : data.userId;
        const { conversationId, content, mediaUrl, mediaType } = data;

        if (!userId || !conversationId) {
          return socket.emit('message_error', { message: 'Unauthorized: Authentication required' });
        }

        // STRICT AUTHORIZATION CHECK via conversationService
        const savedMessage = await conversationService.createMessage(userId, conversationId, {
          content: content ? content.trim() : '',
          mediaUrl,
          mediaType,
        });

        // Broadcast to conversation-specific room
        io.to(`conversation:${conversationId}`).emit('new_message', savedMessage);
      } catch (err) {
        logger.error('Socket send_message authorization error:', err.message);
        socket.emit('message_error', { message: err.message || 'You can only message accepted contacts.' });
      }
    });

    // Event: typing_start
    socket.on('typing_start', (data = {}) => {
      const { conversationId, username } = data;
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          username: username || (socket.user ? socket.user.username : 'User'),
          conversationId,
        });
      }
    });

    // Event: typing_stop
    socket.on('typing_stop', (data = {}) => {
      const { conversationId, username } = data;
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
          username: username || (socket.user ? socket.user.username : 'User'),
          conversationId,
        });
      }
    });

    // -------------------------------------------------------------
    // WEBRTC VOICE & VIDEO CALL SIGNALING EVENTS
    // -------------------------------------------------------------
    socket.on('call_user', (data = {}) => {
      const { userToCall, offer, callType = 'video', conversationId } = data;
      const callerName = socket.user ? socket.user.username : data.callerName;

      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('incoming_call', {
          from: socket.id,
          callerName,
          offer,
          callType,
          conversationId,
        });
      }
    });

    socket.on('answer_call', (data = {}) => {
      const { to, answer } = data;
      io.to(to).emit('call_accepted', { from: socket.id, answer });
    });

    socket.on('ice_candidate', (data = {}) => {
      const { to, candidate } = data;
      if (to && candidate) {
        io.to(to).emit('ice_candidate', { from: socket.id, candidate });
      }
    });

    socket.on('end_call', (data = {}) => {
      const { to, conversationId } = data;
      if (to) {
        io.to(to).emit('call_ended', { from: socket.id });
      } else if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('call_ended', { from: socket.id });
      }
    });

    socket.on('reject_call', (data = {}) => {
      const { to } = data;
      if (to) {
        io.to(to).emit('call_rejected', { from: socket.id });
      }
    });

    // Event: disconnect
    socket.on('disconnect', async () => {
      const session = activeSockets.get(socket.id);
      if (session) {
        const { username } = session;
        activeSockets.delete(socket.id);

        if (userSockets.has(username)) {
          const socketsSet = userSockets.get(username);
          socketsSet.delete(socket.id);

          if (socketsSet.size === 0) {
            userSockets.delete(username);
            await userService.setUserOffline(username);
            await broadcastOnlineUsers(io);
          }
        }
      }
    });
  });
};

module.exports = setupChatSockets;
