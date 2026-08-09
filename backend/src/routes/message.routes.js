const express = require('express');
const { sendMessage, getMessages } = require('../controllers/message.controller');
const { validateSendMessage } = require('../middleware/validate');

const router = express.Router();

router.get('/messages', getMessages);
router.post('/messages', validateSendMessage, sendMessage);

module.exports = router;
