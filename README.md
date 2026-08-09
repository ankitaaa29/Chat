# PulseChat - Production Real-Time Chat Monorepo

PulseChat is a full-stack, enterprise-grade real-time chat platform built as a clean monorepo. It features a modern **React + Vite** web client, a **React Native + Expo** mobile application, a **Node.js + Express** backend API powered by **Socket.io**, and a **PostgreSQL** relational database managed via **Prisma ORM**.

---

## Architecture

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

## Features

- ⚡ **Instant Real-Time Messaging**: Bi-directional communication powered by Socket.io.
- 💾 **Reliable Message Persistence**: Messages are saved to PostgreSQL before broadcasting, preserving full history across page refreshes and container restarts.
- 👥 **Real-Time Online Presence**: Live online/offline status indicators for all connected users.
- ✍️ **Debounced Typing Indicators**: Displays real-time typing state ("Ankita is typing...") with automated debounce throttling.
- 📱 **Cross-Platform Compatibility**: React web client and Expo React Native mobile app share the exact same backend and database.
- 🎨 **Modern SaaS Interface**: Clean typography, glassmorphism card styling, responsive layouts, subtle shadows, and status badges.
- 🐳 **Full Docker Orchestration**: PostgreSQL, Backend API, and Web Frontend containerized together with healthchecks and persistence volumes.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | React 18, Vite 6, Vanilla CSS (Modern Design Tokens), Lucide Icons |
| **Mobile Frontend** | React Native 0.76, Expo SDK 52, Socket.io-client |
| **Backend API** | Node.js v20, Express.js, Socket.io v4.8 |
| **Database & ORM** | PostgreSQL 16, Prisma ORM v6.3 |
| **Containerization**| Docker, Docker Compose, Nginx |

---

## Project Structure

```text
realtime-chat-app/
│
├── backend/                  # Node.js + Express + Socket.io Server
│   ├── src/
│   │   ├── config/           # Environment & Database connections
│   │   ├── controllers/      # REST API route handlers
│   │   ├── middleware/       # Error handling & request validation
│   │   ├── routes/           # REST endpoint declarations
│   │   ├── services/         # Business logic & Prisma DB operations
│   │   ├── sockets/          # Socket.io connection & event handlers
│   │   ├── utils/            # Logger utilities
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # HTTP & Socket.io server bootstrapper
│   ├── prisma/
│   │   └── schema.prisma     # Prisma database schema
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── web/                      # React + Vite SaaS Web Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Login & Chat screens
│   │   ├── hooks/            # Custom useSocket & useChat hooks
│   │   ├── services/         # REST API & Socket.io clients
│   │   ├── utils/            # Time formatters & avatar helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile            # Multi-stage Nginx container build
│   ├── package.json
│   └── .env.example
│
├── mobile/                   # React Native + Expo Mobile Frontend
│   ├── src/
│   │   ├── components/       # Mobile MessageItem, ConnectionStatus, TypingBar
│   │   ├── screens/          # LoginScreen & ChatScreen
│   │   ├── hooks/            # Mobile chat hook
│   │   ├── services/         # Mobile REST & Socket services
│   │   └── utils/            # Mobile helper functions
│   ├── app.json              # Expo SDK 52 configuration
│   ├── App.js                # Mobile app entrypoint
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── architecture.md       # Full architecture specification
│   └── api.md                # REST API & Socket event reference
│
├── docker-compose.yml        # Orchestration for Postgres, Backend, and Web
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Prerequisites

Ensure you have the following installed on your host system:
- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **Docker & Docker Compose**: Docker Desktop or Docker Engine v20.10+
- **Expo CLI** (for mobile execution): `npm install -g expo-cli` or `npx expo`

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://chatuser:chatpassword@localhost:5432/chatdb?schema=public
CLIENT_URL=*
```

### Web (`web/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Docker Quick Start (Web + Backend + PostgreSQL)

The backend API, web frontend, and PostgreSQL database are fully containerized using Docker Compose.

### 1. Build & Start All Containers
```bash
docker compose up --build
```

### 2. Start in Background Mode
```bash
docker compose up -d --build
```

### 3. View Logs
```bash
# View live logs for all services
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# View PostgreSQL logs only
docker compose logs -f postgres
```

### 4. Stop Services
```bash
docker compose down
```

> **Accessing Services**:
> - **Web Application**: `http://localhost:5173`
> - **Backend API**: `http://localhost:5000`
> - **Health Check Endpoint**: `http://localhost:5000/api/health`

---

## Running Web Locally (Without Docker)

1. Start PostgreSQL instance or container:
```bash
docker compose up -d postgres
```
2. Setup and run Backend:
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
3. Run Web application:
```bash
cd web
npm install
npm run dev
```

---

## Running Mobile App (Expo)

The mobile folder is intentionally excluded from Docker and is run natively via Expo.

```bash
cd mobile
npm install
npx expo start
```

> **Note for Mobile Connectivity**:
> - **Android Emulator**: Set `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000` and `EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000`.
> - **Physical iOS/Android Device**: Set `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000` and ensure your phone is connected to the same Wi-Fi network.

---

## API Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning DB and server status. |
| `GET` | `/api/messages?roomId=general` | Returns chat history for specified room. |
| `POST`| `/api/messages` | Sends a message via REST API and persists to DB. |

Full documentation available in [docs/api.md](file:///c:/Projects/chat/docs/api.md).

---

## Socket.io Events Summary

### Client → Server
- `join_room`: `{ username, roomId }`
- `send_message`: `{ username, content, roomId }`
- `typing_start`: `{ username, roomId }`
- `typing_stop`: `{ username, roomId }`

### Server → Client
- `new_message`: Saved message object
- `user_joined`: Notification when user enters room
- `user_left`: Notification when user disconnects
- `user_typing`: Typing status notification
- `user_stopped_typing`: Typing stopped notification
- `online_users`: Current roster of online users

---

## Design Decisions

1. **Why Socket.io?** Socket.io provides automatic fallback transports (WebSocket with polling fallback), auto-reconnection handling, heartbeats, and room abstraction out-of-the-box for cross-platform clients.
2. **Why REST APIs for History?** Fetching message history over HTTP REST simplifies caching, initial page hydration, and error retry mechanisms before initiating the real-time Socket.io handshake.
3. **Why PostgreSQL & Prisma?** PostgreSQL provides strong relational integrity and transactional ACID guarantees. Prisma ORM delivers type safety, automated schema migrations, and clean query builders.
4. **Why Shared Backend for Web & Mobile?** Sharing a single backend avoids code duplication, maintains a single source of truth for online users and message logs, and ensures real-time cross-device communication between Web and Mobile clients.
5. **Why Mobile is Excluded from Docker?** React Native / Expo requires native build toolchains (Android SDK, Xcode, Metro Bundler) that run natively on host hardware for device/emulator development.

---

## Key Verification Tests

To verify full system correctness:

1. **Web Session**: Open Web App at `http://localhost:5173` and log in as `Ankita`.
2. **Mobile Session**: Open Expo Mobile App and log in as `Rahul`.
3. **Real-Time Web → Mobile**: Send "Hello from Web" on Web. Message appears instantly on Mobile.
4. **Real-Time Mobile → Web**: Send "Hi Ankita!" on Mobile. Web displays message instantly.
5. **Persistence**: Refresh Web browser. All previous messages remain visible.
6. **Typing Indicator**: Start typing on Mobile. Web shows `Rahul is typing...`. Stop typing, indicator disappears.
7. **Online Presence**: Close Mobile app. Web updates online user count and marks `Rahul` offline.
8. **Docker Persistence**: Run `docker compose down` followed by `docker compose up -d`. Data in PostgreSQL persists intact.

---

## Future Enhancements

- 🔒 Private & Group 1-on-1 direct messaging rooms
- 📬 Read receipts & message delivery confirmation checkmarks
- 🖼️ File & media attachments (images/documents)
- 🔑 JWT-based user authentication & password hashing
- 🔔 Push notifications for mobile users via Expo Push API
