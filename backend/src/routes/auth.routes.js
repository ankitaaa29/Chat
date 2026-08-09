const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

module.exports = router;
