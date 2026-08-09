# PulseChat - Real-Time Chat Platform Monorepo

PulseChat is a full-stack, enterprise-grade real-time chat platform built as a clean monorepo. It features a modern **React + Vite** web client, a **React Native + Expo SDK 52** mobile application, a **Node.js + Express** backend API powered by **Socket.io**, and a **PostgreSQL** relational database managed via **Prisma ORM**.

---

## 🏗 Architecture

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

## ✨ Features

- ⚡ **Instant Real-Time Messaging**: Bi-directional communication powered by mandatory Socket.io integration.
- 🔒 **1-to-1 Private Contact Messaging**: Secure private conversations between accepted contacts with strict participant authorization.
- 💾 **Reliable Database Persistence**: Messages, user accounts, and contact relationships are saved to PostgreSQL (Prisma ORM) and persist across browser refreshes and container restarts.
- 📷 **Photo & Camera Media Attachments**: Send live camera captures and image attachments with persistent disk volumes (`uploads_data`).
- 👥 **Real-Time Online Presence**: Live online/offline status indicators (`user_status_change`) updated across all connected clients.
- ✍️ **Debounced Typing Indicators**: Displays real-time typing status ("Ankita is typing...") with automated throttling.
- 🤝 **Contact Request System**: Search users by username, send contact requests, and accept or decline incoming requests in real time.
- 📱 **100% Web & Mobile Parity**: Shared Node.js + Express backend powering both the React web application and React Native Expo mobile application.
- 🎨 **Modern Aurora Design Tokens**: Glassmorphism dark mode interface with initial avatars, theme selector (Aurora, Obsidian, Cyberpunk), bio editor, and password management.
- 🐳 **Docker & Docker Compose Orchestration**: Containerized PostgreSQL, Express Backend API, and Nginx Web Frontend with health checks and persistent volume mounts.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Web Frontend** | React 18, Vite 6, Vanilla CSS Tokens (Aurora Glassmorphism), Lucide Icons |
| **Mobile Frontend** | React Native 0.76, Expo SDK 52, React Native Safe Area Context, Socket.io-client |
| **Backend API** | Node.js v20, Express.js, JWT Authentication, Multer |
| **Real-Time Engine** | Socket.io v4.8 |
| **Database & ORM** | PostgreSQL 16, Prisma ORM v6.19 |
| **Containerization**| Docker, Docker Compose, Nginx |

---

## 📁 Project Structure

```text
Chat/
│
├── backend/                  # Node.js + Express + Socket.io Server
│   ├── src/
│   │   ├── config/           # Environment & database connections
│   │   ├── controllers/      # Auth, Contact, Conversation, Message, Upload controllers
│   │   ├── middleware/       # JWT auth & request validation middleware
│   │   ├── routes/           # REST endpoint declarations
│   │   ├── services/         # Business logic & Prisma ORM queries
│   │   ├── sockets/          # Socket.io connection & real-time handlers
│   │   ├── utils/            # Logger & helper utilities
│   │   ├── app.js            # Express app middleware configuration
│   │   └── server.js         # HTTP & Socket.io server bootstrapper
│   ├── prisma/
│   │   └── schema.prisma     # Relational database schema
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── web/                      # React + Vite SaaS Web Frontend
│   ├── src/
│   │   ├── components/       # MessageList, MessageInput, UserList, NavigationSidebar, etc.
│   │   ├── pages/            # DashboardPage & LoginPage
│   │   ├── services/         # REST API & Socket.io client services
│   │   ├── utils/            # Formatters & avatar color utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile            # Multi-stage Nginx container build
│   ├── package.json
│   └── .env.example
│
├── mobile/                   # React Native + Expo Mobile Frontend
│   ├── src/
│   │   ├── components/       # MessageItem component
│   │   ├── screens/          # LoginScreen, RegisterScreen, DashboardScreen
│   │   ├── services/         # Mobile REST API & Socket.io services
│   │   └── utils/            # Mobile helper utilities
│   ├── app.json              # Expo SDK 52 configuration
│   ├── App.js                # Mobile app entrypoint
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml        # Orchestration for PostgreSQL, Backend, and Web
├── .dockerignore
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **Docker & Docker Compose**: Docker Desktop or Docker Engine v20.10+
- **Expo CLI** (for running mobile app): `npx expo`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://chatuser:chatpassword@postgres:5432/chatdb?schema=public
JWT_SECRET=pulsechat_secret_key
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

## 🐳 Docker Quick Start (Web + Backend + PostgreSQL)

The backend API, web frontend, and PostgreSQL database are fully containerized using Docker Compose.

### 1. Build & Start All Services
```bash
docker compose up -d --build
```

### 2. View Service Logs
```bash
# Live logs for all services
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# PostgreSQL logs only
docker compose logs -f postgres
```

### 3. Stop All Services
```bash
docker compose down
```

> **Service Access**:
> - **Web Application**: [`http://localhost:5173`](http://localhost:5173)
> - **Backend API**: [`http://localhost:5000`](http://localhost:5000)
> - **Health Check**: [`http://localhost:5000/api/health`](http://localhost:5000/api/health)

---

## 💻 Running Web & Backend Locally (Without Docker)

### 1. Start PostgreSQL Database Container
```bash
docker compose up -d postgres
```

### 2. Start Backend API
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 3. Start Web Frontend
```bash
cd web
npm install
npm run dev
```

---

## 📱 Running Mobile App (React Native Expo)

```bash
cd mobile
npm install
npx expo start
```

> **Note for Mobile Devices & Emulators**:
> - **Android Emulator**: Uses `http://10.0.2.2:5000` automatically.
> - **Physical iOS/Android Device**: Automatically connects via dynamic LAN IP (`getBackendUrl()`). Ensure device and computer are on the same Wi-Fi network.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check returning database status. |
| `POST` | `/api/auth/register` | Register new user account. |
| `POST` | `/api/auth/login` | Login user and retrieve JWT token. |
| `GET` | `/api/users/search?username=...` | Search users by username. |
| `POST` | `/api/contact-requests` | Send contact request. |
| `GET` | `/api/contact-requests/received` | Fetch received pending requests. |
| `PATCH`| `/api/contact-requests/:id/accept` | Accept pending contact request. |
| `GET` | `/api/conversations` | Fetch active user conversations. |
| `GET` | `/api/conversations/:id/messages` | Fetch chat history for conversation. |
| `POST` | `/api/conversations/:id/messages` | Send message in private conversation. |
| `POST` | `/api/upload` | Upload image/camera attachment. |

---

## 🔌 Socket.io Events Reference

### Client → Server
- `register_user`: `{ username, userId }` — Register active user socket connection.
- `join_conversation`: `{ conversationId, userId }` — Authorize and join private chat room.
- `typing_start`: `{ conversationId, username }` — Broadcast typing indicator.
- `typing_stop`: `{ conversationId, username }` — Broadcast stop typing indicator.

### Server → Client
- `new_message`: Real-time message broadcast object.
- `contact_request_received`: Incoming contact request notification.
- `contact_request_accepted`: Accepted request notification.
- `user_typing`: Real-time typing notification object.
- `user_status_change`: Updated list of online/offline user presences.

---

## 🧠 Design Decisions & Assumptions

1. **Why Socket.io?** Socket.io provides mandatory bi-directional communication, automatic reconnection, heartbeats, and room authorization abstractions across Web and React Native clients.
2. **Why REST API + Socket.io Hybrid Messaging?** Messages are posted through REST API `createMessage` to enforce DB transaction persistence, strict participant verification, and JWT authorization before emitting `new_message` over Socket.io. This guarantees no message loss on network drops.
3. **Why PostgreSQL + Prisma ORM?** Relational structure (`User`, `ContactRequest`, `Conversation`, `ConversationParticipant`, `Message`) ensures strict data integrity for 1-to-1 messaging. Prisma provides type safety and automated database migrations.
4. **Why Persistent Volumes for Uploads?** Mounting `uploads_data:/app/uploads` in Docker ensures media photo attachments are preserved permanently across container rebuilds and server reboots.
5. **Why Shared Backend for Web & Mobile?** A unified Express + Socket.io backend maintains a single source of truth for online presences, messages, and contact authorizations across all clients.

---

## ✅ Key Verification Tests

1. **Web Session**: Open Web App at `http://localhost:5173` and log in as `Ankita`.
2. **Mobile Session**: Open Expo Mobile App and log in as `Gandhi`.
3. **Real-Time Messaging**: Send message from Web. Message appears instantly on Mobile.
4. **Persistence Test**: Refresh Web browser or reload Mobile app. Previous chat history and photo attachments remain 100% intact.
5. **Typing Indicator**: Type in input box on Mobile. Web displays `Gandhi is typing...`.
6. **Online Presence**: Log out on Mobile. Web updates online user count and marks `Gandhi` offline.
7. **Docker Persistence**: Execute `docker compose down` and `docker compose up -d`. All messages and contacts persist in PostgreSQL and disk volume.

---

## 📄 License & Repository

- **GitHub Repository**: [https://github.com/ankitaaa29/Chat.git](https://github.com/ankitaaa29/Chat.git)
