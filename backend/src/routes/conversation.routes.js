const express = require('express');
const {
  getConversations,
  getConversationMessages,
  sendMessage,
} = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router;
