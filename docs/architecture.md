# PulseChat System Architecture

## Overview
PulseChat is a modern real-time private messaging application built around a **Contact Request relationship model** (similar to Instagram/Snapchat).

```text
Login
  ↓
Dashboard (Home, Search, Contacts, Requests, Chats)
  ↓
Search User → Send Contact Request → Receiver Accepts → Private 1-to-1 Conversation Created
```

---

## 🏗 Data Models

### 1. User
- `id`: UUID (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `password`: String (Hashed with `bcryptjs`)
- `isOnline`: Boolean
- `lastSeen`: DateTime

### 2. ContactRequest
- `id`: UUID
- `senderId`: UUID (Foreign Key -> User)
- `receiverId`: UUID (Foreign Key -> User)
- `status`: Enum (`PENDING`, `ACCEPTED`, `REJECTED`)
- `createdAt`, `updatedAt`
- Composite Unique Constraint: `[senderId, receiverId]`

### 3. Conversation
- `id`: UUID
- `createdAt`, `updatedAt`

### 4. ConversationParticipant
- `id`: UUID
- `conversationId`: UUID (Foreign Key -> Conversation)
- `userId`: UUID (Foreign Key -> User)
- Composite Unique Constraint: `[conversationId, userId]`

### 5. Message
- `id`: UUID
- `conversationId`: UUID (Foreign Key -> Conversation)
- `senderId`: UUID (Foreign Key -> User)
- `content`: String
- `mediaUrl`: String (Optional photo attachment)
- `mediaType`: String (`image`)
- `createdAt`

---

## 🔒 Security & Authorization

- **Strict 403 Forbidden Policy**: Both REST controllers and Socket.io events verify that sender and receiver have an `ACCEPTED` contact relationship before allowing any message to be saved or room to be joined.
- **Isolated Conversation Rooms**: Sockets join specific rooms `conversation:<conversationId>`, ensuring strict isolation between user conversations.
