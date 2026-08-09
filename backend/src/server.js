const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { PORT, CLIENT_URL } = require('./config/env');
const { connectDB } = require('./config/db');
const setupChatSockets = require('./sockets/chat.socket');
const logger = require('./utils/logger');

const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach socket event listeners
setupChatSockets(io);

// Connect to Database and start Server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`📡 Socket.io server ready for connections`);
  });
};

// Handle process termination signals
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

startServer();
