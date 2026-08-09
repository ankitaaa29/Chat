# API & Socket.io Event Documentation

## Authentication Endpoints

### 1. User Registration
Creates a new user account with hashed password and returns a signed JWT token.

- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Request Body**:
```json
{
  "username": "Ankita",
  "email": "ankita@example.com",
  "password": "securepassword123"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u123-uuid",
      "username": "Ankita",
      "email": "ankita@example.com",
      "isOnline": true
    }
  }
}
```

---

### 2. User Login
Authenticates user with email/username and password, returning a signed JWT token.

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Request Body**:
```json
{
  "identifier": "ankita@example.com",
  "password": "securepassword123"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u123-uuid",
      "username": "Ankita",
      "email": "ankita@example.com",
      "isOnline": true
    }
  }
}
```

---

### 3. Get Current User Profile
Retrieves current authenticated user details from valid JWT token.

- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "u123-uuid",
    "username": "Ankita",
    "email": "ankita@example.com",
    "isOnline": true
  }
}
```

---

## REST Endpoints

### 1. Health Check
- **Method**: `GET`
- **Path**: `/api/health`

---

### 2. Fetch Chat History
- **Method**: `GET`
- **Path**: `/api/messages`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>` (optional)

---

### 3. Send Message
- **Method**: `POST`
- **Path**: `/api/messages`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>` (optional)
- **Request Body**:
```json
{
  "username": "Ankita",
  "content": "Hello everyone!",
  "roomId": "general"
}
```

---

## Socket.io Specifications

### Socket Handshake Authentication
Client authenticates connection by supplying `auth: { token: "<JWT_TOKEN>" }` in the Socket.io initialization.

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

### Client → Server Events
- `join_room`: `{ username, roomId }`
- `send_message`: `{ username, content, roomId }`
- `typing_start`: `{ username, roomId }`
- `typing_stop`: `{ username, roomId }`

### Server → Client Events
- `new_message`: Saved message object
- `user_joined`: Notification when user enters room
- `user_left`: Notification when user disconnects
- `user_typing`: Typing status notification
- `user_stopped_typing`: Typing stopped notification
- `online_users`: Current roster of online users
