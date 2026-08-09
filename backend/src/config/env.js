const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://chatuser:chatpassword@localhost:5432/chatdb?schema=public',
  CLIENT_URL: process.env.CLIENT_URL || '*',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret_jwt_key_pulsechat_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};
