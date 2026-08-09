const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully via Prisma');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
  }
};

module.exports = { prisma, connectDB };
