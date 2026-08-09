const validateSendMessage = (req, res, next) => {
  const { username, content, mediaUrl, roomId } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: "username" is required and must be a non-empty string',
    });
  }

  if ((!content || typeof content !== 'string' || !content.trim()) && !mediaUrl) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Either text "content" or "mediaUrl" photo is required',
    });
  }

  req.body.username = username.trim();
  req.body.content = content ? content.trim() : '';
  req.body.roomId = (roomId && typeof roomId === 'string' && roomId.trim()) ? roomId.trim() : 'general';

  next();
};

module.exports = { validateSendMessage };
