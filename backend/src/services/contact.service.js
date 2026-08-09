const { prisma } = require('../config/db');
const logger = require('../utils/logger');

class ContactService {
  // Search users and annotate with relationship state relative to currentUserId
  async searchUsers(currentUserId, searchUsername) {
    if (!searchUsername || !searchUsername.trim()) return [];

    const query = searchUsername.trim();

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 30,
    });

    if (users.length === 0) return [];

    // Fetch existing contact requests involving currentUserId
    const requests = await prisma.contactRequest.findMany({
      where: {
        OR: [
          { senderId: currentUserId },
          { receiverId: currentUserId },
        ],
      },
    });

    const relationshipMap = new Map();
    requests.forEach((req) => {
      const otherId = req.senderId === currentUserId ? req.receiverId : req.senderId;
      let state = 'NONE';

      if (req.status === 'ACCEPTED') {
        state = 'ACCEPTED';
      } else if (req.status === 'REJECTED') {
        state = 'REJECTED';
      } else if (req.status === 'PENDING') {
        state = req.senderId === currentUserId ? 'PENDING_SENT' : 'PENDING_RECEIVED';
      }

      relationshipMap.set(otherId, { state, requestId: req.id });
    });

    return users.map((user) => {
      const rel = relationshipMap.get(user.id) || { state: 'NONE', requestId: null };
      return {
        ...user,
        relationshipState: rel.state,
        requestId: rel.requestId,
      };
    });
  }

  // Send Contact Request
  async sendContactRequest(senderId, receiverId) {
    if (senderId === receiverId) {
      throw new Error('You cannot send a contact request to yourself');
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      throw new Error('User not found');
    }

    // Check if request or reverse request already exists
    const existing = await prisma.contactRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'PENDING') {
        throw new Error('A contact request is already pending between you and this user');
      }
      if (existing.status === 'ACCEPTED') {
        throw new Error('You are already contacts with this user');
      }
      // If previously rejected, allow re-sending by updating
      return await prisma.contactRequest.update({
        where: { id: existing.id },
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
        include: {
          sender: { select: { id: true, username: true, email: true } },
          receiver: { select: { id: true, username: true, email: true } },
        },
      });
    }

    return await prisma.contactRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        receiver: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // Get Received Pending Requests
  async getReceivedRequests(userId) {
    return await prisma.contactRequest.findMany({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: { id: true, username: true, email: true, isOnline: true, lastSeen: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get Sent Requests
  async getSentRequests(userId) {
    return await prisma.contactRequest.findMany({
      where: {
        senderId: userId,
      },
      include: {
        receiver: {
          select: { id: true, username: true, email: true, isOnline: true, lastSeen: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Accept Contact Request
  async acceptContactRequest(userId, requestId) {
    const request = await prisma.contactRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true },
    });

    if (!request) {
      throw new Error('Contact request not found');
    }

    if (request.receiverId !== userId) {
      throw new Error('Unauthorized: Only the recipient can accept this contact request');
    }

    // Update status to ACCEPTED
    const updatedRequest = await prisma.contactRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        receiver: { select: { id: true, username: true, email: true } },
      },
    });

    // Create 1-to-1 Conversation if not already existing
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: request.senderId } } },
          { participants: { some: { userId: request.receiverId } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: request.senderId },
              { userId: request.receiverId },
            ],
          },
        },
      });
    }

    return {
      request: updatedRequest,
      conversationId: conversation.id,
    };
  }

  // Reject Contact Request
  async rejectContactRequest(userId, requestId) {
    const request = await prisma.contactRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Contact request not found');
    }

    if (request.receiverId !== userId) {
      throw new Error('Unauthorized: Only the recipient can reject this contact request');
    }

    return await prisma.contactRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  // Get Accepted Contacts List
  async getContacts(userId) {
    const requests = await prisma.contactRequest.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, email: true, isOnline: true, lastSeen: true } },
        receiver: { select: { id: true, username: true, email: true, isOnline: true, lastSeen: true } },
      },
    });

    return requests.map((req) => {
      const contactUser = req.senderId === userId ? req.receiver : req.sender;
      return {
        ...contactUser,
        requestId: req.id,
      };
    });
  }

  // Check if two users are accepted contacts
  async areAcceptedContacts(userAId, userBId) {
    if (!userAId || !userBId) return false;
    const req = await prisma.contactRequest.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: userAId, receiverId: userBId },
          { senderId: userBId, receiverId: userAId },
        ],
      },
    });
    return !!req;
  }
}

module.exports = new ContactService();
