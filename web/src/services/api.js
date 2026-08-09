const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
};

export const fetchChatHistory = async (roomId = 'general', limit = 100) => {
  const response = await fetch(`${API_URL}/api/messages?roomId=${encodeURIComponent(roomId)}&limit=${limit}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch chat history');
  }
  return response.json();
};

export const sendMessageApi = async ({ username, content, roomId = 'general' }) => {
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
