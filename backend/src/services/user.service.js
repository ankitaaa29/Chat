const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const logger = require('../utils/logger');

class UserService {
  generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  async registerUser({ username, email, password }) {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: trimmedUsername }, { email: trimmedEmail }],
      },
    });

    if (existingUser) {
      if (existingUser.username === trimmedUsername) {
        throw new Error('Username is already taken');
      }
      if (existingUser.email === trimmedEmail) {
        throw new Error('Email address is already registered');
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword,
        isOnline: true,
        lastSeen: new Date(),
      },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isOnline: user.isOnline,
      },
    };
  }

  async loginUser({ identifier, password }) {
    const trimmedIdentifier = identifier.trim();

    // Search user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedIdentifier },
          { email: trimmedIdentifier.toLowerCase() },
        ],
      },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials: User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials: Password incorrect');
    }

    // Mark online
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isOnline: true,
      },
    };
  }

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
      return null;
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
      }).catch(() => null);
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
          email: true,
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
}

module.exports = new UserService();
