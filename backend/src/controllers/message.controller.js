const messageService = require('../services/message.service');
const { getIO } = require('../sockets/socketManager');

const sendMessage = async (req, res, next) => {
  try {
    const { username, content, mediaUrl, mediaType, roomId } = req.body;

    if (!username || (!content && !mediaUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Message content or media attachment is required',
      });
    }

    const message = await messageService.createMessage({
      username,
      content,
      mediaUrl,
      mediaType,
      roomId,
    });

    try {
      const io = getIO();
      if (io) {
        const targetRoom = message.roomId || 'general';
        io.to(targetRoom).emit('new_message', message);
      }
    } catch (socketErr) {
      console.warn('Socket broadcast warning:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { roomId, limit } = req.query;
    const messages = await messageService.getMessages(roomId || 'general', limit);

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
