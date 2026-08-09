# REST API & WebSocket Documentation

Base URL: `http://localhost:5000/api`

---

## 🔐 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account with hashed password (`bcryptjs`) and returns a signed JWT token.

- **Request Body**:
  ```json
  {
    "username": "ankita",
    "email": "ankita@example.com",
    "password": "Password123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid-v4",
        "username": "ankita",
        "email": "ankita@example.com"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

---

### `POST /api/auth/login`
Authenticates user using email or username and returns a signed JWT token.

- **Request Body**:
  ```json
  {
    "identifier": "ankita@example.com",
    "password": "Password123"
  }
  ```

---

## 📷 2. Media & Upload Endpoints

### `POST /api/upload`
Uploads photos or files to the backend static storage (`backend/uploads/`).

- **Headers**: `Content-Type: multipart/form-data`
- **Request Body**:
  - `file`: Image/Photo file binary.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "File uploaded successfully",
    "data": {
      "fileUrl": "/uploads/photo-1786275841029.jpg",
      "fileName": "photo-1786275841029.jpg",
      "mediaType": "image"
    }
  }
  ```

---

## 💬 3. Chat & Message Endpoints

### `POST /api/messages`
Sends a text message and/or photo media attachment.

- **Headers**: `Authorization: Bearer <jwt_token>`
- **Request Body**:
  ```json
  {
    "username": "ankita",
    "content": "Check out this photo!",
    "mediaUrl": "/uploads/photo-1786275841029.jpg",
    "mediaType": "image",
    "roomId": "general"
  }
  ```

---

### `GET /api/messages?roomId=general&limit=100`
Retrieves chat history for a channel.

---

## ⚡ 4. WebSocket Real-Time Events (`Socket.io`)

- **Handshake Connection**:
  Pass JWT token in auth: `{ auth: { token: "<jwt_token>" } }`.
- **Events**:
  - `send_message`: `{ username, content, mediaUrl, mediaType, roomId }`
  - `new_message`: Broadcasts message payload to room members.
  - `typing_start` / `typing_stop`: Broadcasts user typing activity.
  - `online_users`: Transmits array of active online user objects.
