const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chat_token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const registerApi = async ({ username, email, password }) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

export const loginApi = async ({ identifier, password }) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const uploadFileApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('chat_token');
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload photo');
  }
  return data;
};

export const fetchHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
};

export const fetchChatHistory = async (roomId = 'general', limit = 100) => {
  const response = await fetch(`${API_URL}/api/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch chat history');
  }
  return response.json();
};

export const sendMessageApi = async ({ username, content, mediaUrl, mediaType, roomId = 'general' }) => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ username, content, mediaUrl, mediaType, roomId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send message');
  }
  return response.json();
};
