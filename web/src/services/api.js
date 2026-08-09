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

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload photo');
  }
  return data;
};

// -------------------------------------------------------------
// CONTACT REQUEST & PRIVATE MESSAGING REST ENDPOINTS
// -------------------------------------------------------------

export const searchUsersApi = async (username) => {
  const response = await fetch(`${API_URL}/api/users/search?username=${encodeURIComponent(username)}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'User search failed');
  return data;
};

export const sendContactRequestApi = async (receiverId) => {
  const response = await fetch(`${API_URL}/api/contact-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ receiverId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send contact request');
  return data;
};

export const fetchReceivedRequestsApi = async () => {
  const response = await fetch(`${API_URL}/api/contact-requests/received`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch incoming requests');
  return data;
};

export const fetchSentRequestsApi = async () => {
  const response = await fetch(`${API_URL}/api/contact-requests/sent`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch sent requests');
  return data;
};

export const acceptContactRequestApi = async (requestId) => {
  const response = await fetch(`${API_URL}/api/contact-requests/${requestId}/accept`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to accept request');
  return data;
};

export const rejectContactRequestApi = async (requestId) => {
  const response = await fetch(`${API_URL}/api/contact-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to reject request');
  return data;
};

export const fetchContactsApi = async () => {
  const response = await fetch(`${API_URL}/api/contacts`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch contacts');
  return data;
};

export const fetchConversationsApi = async () => {
  const response = await fetch(`${API_URL}/api/conversations`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations');
  return data;
};

export const fetchConversationMessagesApi = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversation messages');
  return data;
};

export const sendConversationMessageApi = async (conversationId, { content, mediaUrl, mediaType }) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ content, mediaUrl, mediaType }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data;
};
