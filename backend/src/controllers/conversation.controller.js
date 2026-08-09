const conversationService = require('../services/conversation.service');
const { getIO } = require('../sockets/socketManager');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await conversationService.getUserConversations(req.user.id);
    return res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { limit } = req.query;

    const messages = await conversationService.getConversationMessages(
      req.user.id,
      conversationId,
      limit
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, mediaUrl, mediaType } = req.body;
    const senderId = req.user.id;

    if (!content && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either message content or photo mediaUrl is required',
      });
    }

    const message = await conversationService.createMessage(senderId, conversationId, {
      content,
      mediaUrl,
      mediaType,
    });

    // Broadcast new message to conversation socket room
    try {
      const io = getIO();
      if (io) {
        io.to(`conversation:${conversationId}`).emit('new_message', message);
      }
    } catch (socketErr) {
      console.warn('Socket broadcast error:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversationMessages,
  sendMessage,
};
