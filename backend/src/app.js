const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const healthRoutes = require('./routes/health.routes');
const messageRoutes = require('./routes/message.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const contactRoutes = require('./routes/contact.routes');
const conversationRoutes = require('./routes/conversation.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'PulseChat Real-Time Backend API is live!',
    health: '/api/health',
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', healthRoutes);
app.use('/api', contactRoutes);
app.use('/api', conversationRoutes);
app.use('/api', messageRoutes);
app.use('/api', uploadRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
