const validateSendMessage = (req, res, next) => {
  const { username, content, roomId } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "username" is required and must be a non-empty string',
    });
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "content" is required and must be a non-empty string',
    });
  }

  if (content.length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Message content exceeds maximum length of 2000 characters',
    });
  }

  req.body.username = username.trim();
  req.body.content = content.trim();
  req.body.roomId = (roomId && typeof roomId === 'string' && roomId.trim()) ? roomId.trim() : 'general';

  next();
};

module.exports = { validateSendMessage };
