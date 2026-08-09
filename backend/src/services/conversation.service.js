const { prisma } = require('../config/db');
const contactService = require('./contact.service');
const logger = require('../utils/logger');

class ConversationService {
  // Get active conversations for userId
  async getUserConversations(userId) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, username: true, email: true, isOnline: true, lastSeen: true },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: { select: { id: true, username: true } },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: { updatedAt: 'desc' },
      },
    });

    return participants.map((p) => {
      const conv = p.conversation;
      const otherParticipant = conv.participants.find((pt) => pt.userId !== userId);
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherUser: otherParticipant ? otherParticipant.user : null,
        lastMessage,
      };
    });
  }

  // Get messages for a specific conversation (verifying user participant)
  async getConversationMessages(userId, conversationId, limit = 100) {
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!isParticipant) {
      const err = new Error('Unauthorized: You are not a participant in this conversation');
      err.statusCode = 403;
      throw err;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, username: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(parseInt(limit, 10) || 100, 500),
    });

    return messages;
  }

  // Send message in conversation with STRICT 403 ACCEPTED CONTACT AUTHORIZATION CHECK
  async createMessage(senderId, conversationId, { content, mediaUrl, mediaType }) {
    // 1. Verify sender is participant in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });

    if (!conversation) {
      const err = new Error('Conversation not found');
      err.statusCode = 44;
      throw err;
    }

    const isSenderParticipant = conversation.participants.some((p) => p.userId === senderId);
    if (!isSenderParticipant) {
      const err = new Error('You can only message accepted contacts.');
      err.statusCode = 403;
      throw err;
    }

    // 2. Identify recipient user in 1-to-1 conversation
    const recipient = conversation.participants.find((p) => p.userId !== senderId);
    if (recipient) {
      // 3. STRICT CHECK: Are sender and recipient ACCEPTED contacts?
      const areContacts = await contactService.areAcceptedContacts(senderId, recipient.userId);
      if (!areContacts) {
        const err = new Error('You can only message accepted contacts.');
        err.statusCode = 403;
        throw err;
      }
    }

    // 4. Save message to PostgreSQL DB
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content || '',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
      include: {
        sender: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    // 5. Touch conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}

module.exports = new ConversationService();
