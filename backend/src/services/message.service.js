const { prisma } = require('../config/db');
const userService = require('./user.service');
const logger = require('../utils/logger');

class MessageService {
  async createMessage({ username, content, roomId = 'general' }) {
    try {
      // Ensure user exists in database
      let user = await userService.upsertUser(username, true);

      const message = await prisma.message.create({
        data: {
          content,
          username,
          userId: user ? user.id : null,
          roomId: roomId || 'general',
        },
      });

      return message;
    } catch (error) {
      logger.error('MessageService.createMessage error:', error.message);
      throw error;
    }
  }

  async getMessages(roomId = 'general', limit = 100) {
    try {
      const take = Math.min(parseInt(limit, 10) || 100, 500);

      const messages = await prisma.message.findMany({
        where: roomId ? { roomId } : {},
        orderBy: { createdAt: 'asc' },
        take,
      });

      return messages;
    } catch (error) {
      logger.error('MessageService.getMessages error:', error.message);
      throw error;
    }
  }
}

module.exports = new MessageService();
