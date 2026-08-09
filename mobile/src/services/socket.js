import { io } from 'socket.io-client';
import { getBackendUrl } from './api';

let mobileSocketInstance = null;

const getOrCreateSocket = () => {
  const url = getBackendUrl();
  
  if (mobileSocketInstance && mobileSocketInstance._url === url) {
    return mobileSocketInstance;
  }

  // Disconnect old socket if URL changed
  if (mobileSocketInstance) {
    try { mobileSocketInstance.disconnect(); } catch (e) {}
  }

  const socket = io(url, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket._url = url;
  mobileSocketInstance = socket;
  console.log('📡 Mobile Socket Service connected to:', url);
  return socket;
};

// Initialize on first import
mobileSocketInstance = getOrCreateSocket();

// Proxy object that always delegates to the current socket instance
export const mobileSocket = {
  get connected() { return getOrCreateSocket().connected; },
  get id() { return getOrCreateSocket().id; },
  set auth(val) { getOrCreateSocket().auth = val; },
  get auth() { return getOrCreateSocket().auth; },
  connect: () => getOrCreateSocket().connect(),
  disconnect: () => getOrCreateSocket().disconnect(),
  emit: (...args) => getOrCreateSocket().emit(...args),
  on: (...args) => getOrCreateSocket().on(...args),
  off: (...args) => getOrCreateSocket().off(...args),
};

export const connectMobileSocket = (username, roomId = 'general', token = null) => {
  const socket = getOrCreateSocket();
  
  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join_room', { username, roomId });
};

export const disconnectMobileSocket = () => {
  const socket = getOrCreateSocket();
  if (socket.connected) {
    socket.disconnect();
  }
};

export const reconnectMobileSocket = () => {
  // Force recreation with current URL
  if (mobileSocketInstance) {
    try { mobileSocketInstance.disconnect(); } catch (e) {}
  }
  mobileSocketInstance = null;
  return getOrCreateSocket();
};
