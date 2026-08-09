import { io } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const mobileSocket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export const connectMobileSocket = (username, roomId = 'general', token = null) => {
  if (token) {
    mobileSocket.auth = { token };
  }

  if (!mobileSocket.connected) {
    mobileSocket.connect();
  }
  mobileSocket.emit('join_room', { username, roomId });
};

export const disconnectMobileSocket = () => {
  if (mobileSocket.connected) {
    mobileSocket.disconnect();
  }
};
