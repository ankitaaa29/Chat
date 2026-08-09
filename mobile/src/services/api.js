const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const fetchMobileHistory = async (roomId = 'general', limit = 100) => {
  const response = await fetch(`${API_URL}/api/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch messages');
  }
  return response.json();
};

export const sendMobileMessageApi = async ({ username, content, roomId = 'general' }) => {
  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, content, roomId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send message');
  }
  return response.json();
};
