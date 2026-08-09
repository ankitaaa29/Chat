const contactService = require('../services/contact.service');
const { getIO } = require('../sockets/socketManager');

const searchUsers = async (req, res, next) => {
  try {
    const { username } = req.query;
    const currentUserId = req.user.id;

    const users = await contactService.searchUsers(currentUserId, username);
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const sendContactRequest = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'receiverId is required',
      });
    }

    const request = await contactService.sendContactRequest(senderId, receiverId);

    // Broadcast real-time socket event to receiver
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${receiverId}`).emit('contact_request_received', {
          request,
          senderName: req.user.username,
        });
      }
    } catch (socketErr) {
      console.warn('Socket notification error:', socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Contact request sent successfully',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await contactService.getReceivedRequests(req.user.id);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const getSentRequests = async (req, res, next) => {
  try {
    const requests = await contactService.getSentRequests(req.user.id);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

const acceptContactRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const result = await contactService.acceptContactRequest(req.user.id, requestId);

    // Notify sender that request was accepted
    try {
      const io = getIO();
      if (io && result.request) {
        io.to(`user:${result.request.senderId}`).emit('contact_request_accepted', {
          request: result.request,
          acceptorName: req.user.username,
          conversationId: result.conversationId,
        });
      }
    } catch (socketErr) {
      console.warn('Socket notification error:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Contact request accepted',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const rejectContactRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await contactService.rejectContactRequest(req.user.id, requestId);

    try {
      const io = getIO();
      if (io && request) {
        io.to(`user:${request.senderId}`).emit('contact_request_rejected', {
          requestId,
          rejectorName: req.user.username,
        });
      }
    } catch (socketErr) {
      console.warn('Socket notification error:', socketErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Contact request rejected',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getContacts(req.user.id);
    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchUsers,
  sendContactRequest,
  getReceivedRequests,
  getSentRequests,
  acceptContactRequest,
  rejectContactRequest,
  getContacts,
};
