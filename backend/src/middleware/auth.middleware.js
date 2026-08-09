const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { prisma } = require('../config/db');

const verifyToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Access token missing',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true, isOnline: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = { protect, verifyToken };
