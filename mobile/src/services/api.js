import Constants from 'expo-constants';
import { Platform } from 'react-native';

let activeCustomUrl = null;

export const setCustomBackendUrl = (url) => {
  if (url) {
    activeCustomUrl = url.trim().replace(/\/+$/, '');
  }
};

export const getBackendUrl = () => {
  if (activeCustomUrl) {
    return activeCustomUrl;
  }

  // 1. Dynamic Metro Host IP from Expo Go / CLI connection
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.inputs?.find((i) => i.type === 'remote')?.value;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  // 2. Explicit Environment Variable if non-localhost
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 3. Android Emulator Fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 4. Physical Device LAN IP Fallback
  return 'http://192.168.1.5:5000';
};

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

export const registerMobileApi = async ({ username, email, password }) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const loginMobileApi = async ({ identifier, password }) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const uploadMobileFileApi = async (fileUri, token = null) => {
  const url = getBackendUrl();
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type,
  });

  const response = await fetch(`${url}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Photo upload failed');
  return data;
};

// -------------------------------------------------------------
// CONTACT REQUEST & PRIVATE MESSAGING ENDPOINTS FOR MOBILE
// -------------------------------------------------------------

export const searchMobileUsersApi = async (username, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/users/search?username=${encodeURIComponent(username)}`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'User search failed');
  return data;
};

export const sendMobileContactRequestApi = async (receiverId, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contact-requests`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ receiverId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send request');
  return data;
};

export const fetchMobileReceivedRequestsApi = async (token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contact-requests/received`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch requests');
  return data;
};

export const fetchMobileSentRequestsApi = async (token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contact-requests/sent`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch requests');
  return data;
};

export const acceptMobileContactRequestApi = async (requestId, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contact-requests/${requestId}/accept`, {
    method: 'PATCH',
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to accept request');
  return data;
};

export const rejectMobileContactRequestApi = async (requestId, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contact-requests/${requestId}/reject`, {
    method: 'PATCH',
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to reject request');
  return data;
};

export const fetchMobileContactsApi = async (token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/contacts`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch contacts');
  return data;
};

export const fetchMobileConversationsApi = async (token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/conversations`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations');
  return data;
};

export const fetchMobileConversationMessagesApi = async (conversationId, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/conversations/${conversationId}/messages`, {
    headers: getHeaders(token),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch messages');
  return data;
};

export const sendMobileConversationMessageApi = async (conversationId, { content, mediaUrl, mediaType }, token = null) => {
  const url = getBackendUrl();
  const response = await fetch(`${url}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ content, mediaUrl, mediaType }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data;
};
