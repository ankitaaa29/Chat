const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const registerMobileApi = async ({ username, email, password }) => {
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

export const loginMobileApi = async ({ identifier, password }) => {
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

export const fetchMobileHistory = async (roomId = 'general', limit = 100, token = null) => {
  const response = await fetch(`${API_URL}/api/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch messages');
  }
  return response.json();
};

export const sendMobileMessageApi = async ({ username, content, roomId = 'general' }, token = null) => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ username, content, roomId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send message');
  }
  return response.json();
};
