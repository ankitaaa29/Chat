# System Architecture Documentation

## Overview

PulseChat is a real-time, cross-platform communication application built as a monorepo. It features a React + Vite web application, a React Native + Expo mobile application, a Node.js + Express.js backend, and a PostgreSQL relational database managed by Prisma ORM.

Real-time bi-directional messaging is powered by **Socket.io**.

---

## High-Level System Architecture

```text
┌─────────────────────────────────────────┐
│              React Web App              │
│       (Docker Container / Port 5173)     │
└────────────────────┬────────────────────┘
                     │
          REST APIs / Socket.io Client
                     │
┌────────────────────▼────────────────────┐         ┌─────────────────────────────────────────┐
│        Node.js + Express Server         │         │          React Native Mobile            │
│       (Docker Container / Port 5000)    │◄────────┤             (Expo App)                  │
│               Socket.io                 │         │          (Runs Separately)              │
└────────────────────┬────────────────────┘         └─────────────────────────────────────────┘
                     │
                 Prisma ORM
                     │
┌────────────────────▼────────────────────┐
│           PostgreSQL Database           │
│       (Docker Container / Port 5432)    │
└─────────────────────────────────────────┘
```

---

## Technical Stack & Roles

### 1. Backend Service (`backend/`)
- **Runtime**: Node.js v20+ with Express.js framework
- **Real-Time Layer**: Socket.io Server v4.8+
- **ORM & Database Client**: Prisma ORM v6.3+
- **Security & Logging**: Helmet, CORS, Morgan logger
- **Responsibilities**:
  - Handles HTTP REST requests for chat history and health checks.
  - Manages Socket.io connections, room subscriptions, typing states, and online user presence.
  - Guarantees message persistence in PostgreSQL before broadcasting events over WebSockets.

### 2. Web Frontend (`web/`)
- **Framework**: React 18 + Vite 6
- **Styling**: Modern SaaS Vanilla CSS Design System with custom tokens, responsive grid, glassmorphism UI, and dark mode palette.
- **Icons**: Lucide React
- **Real-Time Client**: Socket.io-client
- **Containerization**: Nginx reverse proxy serving built static assets on port 5173.

### 3. Mobile Frontend (`mobile/`)
- **Framework**: React Native + Expo (Expo SDK 52)
- **Real-Time Client**: Socket.io-client
- **UI Components**: Native `SafeAreaView`, `FlatList`, `KeyboardAvoidingView` optimized for touch targets and mobile keyboards.
- **Execution**: Runs independently outside Docker for mobile emulator or device deployment.

### 4. Database (`postgres`)
- **Engine**: PostgreSQL 16 Alpine
- **Persistence**: Managed Docker Volume (`postgres_data`) ensuring data survives container lifecycle restarts.

---

## Data Flow & Real-Time Sequence

When a user submits a message:

```text
User Submits Message
         │
         ▼
Socket.io Event ("send_message") / REST POST /api/messages
         │
         ▼
Node.js Express Backend Handler
         │
         ▼
Prisma ORM writes Message record to PostgreSQL Database
         │
         ▼
Backend emits "new_message" event to Socket.io Room ("general")
         │
         ▼
All connected Web and Mobile clients receive "new_message" payload instantly
         │
         ▼
Client UI updates message stream with zero latency
```

---

## Database Schema (Prisma)

### `User` Entity
- `id` (String / UUID, Primary Key)
- `username` (String, Unique)
- `isOnline` (Boolean, default: false)
- `lastSeen` (DateTime, default: now)
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto updated)

### `Message` Entity
- `id` (String / UUID, Primary Key)
- `content` (String, max 2000 chars)
- `username` (String)
- `userId` (String / Foreign Key to User, optional)
- `roomId` (String, default: "general")
- `createdAt` (DateTime, default: now)
- `updatedAt` (DateTime, auto updated)
