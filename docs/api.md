# API & Socket.io Event Documentation

## REST Endpoints

### 1. Health Check
Checks backend service operational status and PostgreSQL database connection.

- **Method**: `GET`
- **Path**: `/api/health`
- **Query Parameters**: None
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-08-09T16:40:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

---

### 2. Fetch Chat History
Retrieves historical messages for a designated chat room.

- **Method**: `GET`
- **Path**: `/api/messages`
- **Query Parameters**:
  - `roomId` (optional, default: `"general"`): Target room identifier.
  - `limit` (optional, default: `100`, max: `500`): Number of messages to retrieve.
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "e3b0c442-98fc-42fa-9a6d-55e100f7d544",
      "content": "Hello from Web",
      "username": "Ankita",
      "userId": "user-uuid-1",
      "roomId": "general",
      "createdAt": "2026-08-09T16:30:00.000Z",
      "updatedAt": "2026-08-09T16:30:00.000Z"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "content": "Hi Ankita!",
      "username": "Rahul",
      "userId": "user-uuid-2",
      "roomId": "general",
      "createdAt": "2026-08-09T16:31:00.000Z",
      "updatedAt": "2026-08-09T16:31:00.000Z"
    }
  ]
}
```

---

### 3. Send Message
Persists a new chat message to PostgreSQL and broadcasts it to room subscribers.

- **Method**: `POST`
- **Path**: `/api/messages`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "username": "Ankita",
  "content": "Hello everyone!",
  "roomId": "general"
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "f8a1c900-1122-3344-5566-778899aabbcc",
    "content": "Hello everyone!",
    "username": "Ankita",
    "userId": "user-uuid-1",
    "roomId": "general",
    "createdAt": "2026-08-09T16:35:00.000Z",
    "updatedAt": "2026-08-09T16:35:00.000Z"
  }
}
```
- **Error Response** (`400 Bad Request`):
```json
{
  "success": false,
  "message": "Validation Error: \"username\" is required and must be a non-empty string"
}
```

---

## Socket.io Specifications

### Client → Server Events

| Event Name | Payload Format | Description |
| :--- | :--- | :--- |
| `join_room` | `{ username: "Ankita", roomId: "general" }` | Registers user socket session, marks user online in DB, joins room. |
| `send_message` | `{ username: "Ankita", content: "Hello!", roomId: "general" }` | Saves message to DB first, then broadcasts `new_message` to room. |
| `typing_start` | `{ username: "Ankita", roomId: "general" }` | Emits typing notification to room members. |
| `typing_stop` | `{ username: "Ankita", roomId: "general" }` | Cancels typing notification. |

### Server → Client Events

| Event Name | Payload Format | Description |
| :--- | :--- | :--- |
| `new_message` | Message object (see POST response above) | Sent immediately after message is persisted to DB. |
| `user_joined` | `{ username: "Ankita", roomId: "general", timestamp: "..." }` | Broadcast when a new user joins room. |
| `user_left` | `{ username: "Ankita", roomId: "general", timestamp: "..." }` | Broadcast when a user disconnects. |
| `user_typing` | `{ username: "Ankita", roomId: "general" }` | Emitted to room when user begins typing. |
| `user_stopped_typing` | `{ username: "Ankita", roomId: "general" }` | Emitted to room when user stops typing. |
| `online_users` | `[{ id, username, isOnline, lastSeen }]` | Broadcasts current online user roster to all clients. |
