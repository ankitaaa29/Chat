const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('chat_token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    window.location.reload();
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const registerApi = async ({ username, email, password }) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(response);
};

export const loginApi = async ({ identifier, password }) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return handleResponse(response);
};

export const uploadFileApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

// -------------------------------------------------------------
// CONTACT REQUEST & PRIVATE MESSAGING REST ENDPOINTS
// -------------------------------------------------------------

export const searchUsersApi = async (username) => {
  const response = await fetch(`${API_URL}/api/users/search?username=${encodeURIComponent(username)}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
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
  return handleResponse(response);
};

export const fetchReceivedRequestsApi = async () => {
  const response = await fetch(`${API_URL}/api/contact-requests/received`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchSentRequestsApi = async () => {
  const response = await fetch(`${API_URL}/api/contact-requests/sent`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const acceptContactRequestApi = async (requestId) => {
  const response = await fetch(`${API_URL}/api/contact-requests/${requestId}/accept`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const rejectContactRequestApi = async (requestId) => {
  const response = await fetch(`${API_URL}/api/contact-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchContactsApi = async () => {
  const response = await fetch(`${API_URL}/api/contacts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchConversationsApi = async () => {
  const response = await fetch(`${API_URL}/api/conversations`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const fetchConversationMessagesApi = async (conversationId) => {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
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
  return handleResponse(response);
};
