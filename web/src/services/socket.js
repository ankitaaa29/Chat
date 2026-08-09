import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export const connectSocket = (username, roomId = 'general', token = null) => {
  if (token) {
    socket.auth = { token };
  } else {
    const storedToken = localStorage.getItem('chat_token');
    if (storedToken) {
      socket.auth = { token: storedToken };
    }
  }

  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join_room', { username, roomId });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
