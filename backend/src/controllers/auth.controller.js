const userService = require('../services/user.service');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await userService.registerUser({ username, email, password });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('already taken') || error.message.includes('already registered')) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required',
      });
    }

    const result = await userService.loginUser({ identifier, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = {
  register,
  login,
  getMe,
};
