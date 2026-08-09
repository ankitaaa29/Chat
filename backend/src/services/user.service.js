const { prisma } = require('../config/db');
const logger = require('../utils/logger');

class UserService {
  async upsertUser(username, isOnline = true) {
    if (!username) return null;
    try {
      const user = await prisma.user.upsert({
        where: { username },
        update: {
          isOnline,
          lastSeen: new Date(),
        },
        create: {
          username,
          isOnline,
          lastSeen: new Date(),
        },
      });
      return user;
    } catch (error) {
      logger.error(`UserService.upsertUser error for ${username}:`, error.message);
      throw error;
    }
  }

  async setUserOffline(username) {
    if (!username) return null;
    try {
      const user = await prisma.user.update({
        where: { username },
        data: {
          isOnline: false,
          lastSeen: new Date(),
        },
      }).catch(() => null); // handle case where user might not exist in db
      return user;
    } catch (error) {
      logger.error(`UserService.setUserOffline error for ${username}:`, error.message);
      return null;
    }
  }

  async getOnlineUsers() {
    try {
      const users = await prisma.user.findMany({
        where: { isOnline: true },
        select: {
          id: true,
          username: true,
          isOnline: true,
          lastSeen: true,
        },
        orderBy: { username: 'asc' },
      });
      return users;
    } catch (error) {
      logger.error('UserService.getOnlineUsers error:', error.message);
      return [];
    }
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          isOnline: true,
          lastSeen: true,
        },
        orderBy: { username: 'asc' },
      });
      return users;
    } catch (error) {
      logger.error('UserService.getAllUsers error:', error.message);
      return [];
    }
  }
}

module.exports = new UserService();
