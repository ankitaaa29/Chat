import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMobileHistory, sendMobileMessageApi } from '../services/api';
import { mobileSocket, connectMobileSocket } from '../services/socket';

export const useMobileChat = (username, roomId = 'general', token = null) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connectionState, setConnectionState] = useState(
    mobileSocket.connected ? 'connected' : 'offline'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchMobileHistory(roomId, 100, token);
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load mobile history:', err);
      setError(err.message || 'Unable to connect');
    } finally {
      setLoading(false);
    }
  }, [roomId, token]);

  useEffect(() => {
    if (!username) return;

    loadHistory();
    connectMobileSocket(username, roomId, token);

    const onConnect = () => setConnectionState('connected');
    const onDisconnect = () => setConnectionState('offline');
    const onConnectError = () => setConnectionState('reconnecting');

    mobileSocket.on('connect', onConnect);
    mobileSocket.on('disconnect', onDisconnect);
    mobileSocket.on('connect_error', onConnectError);

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users || []);

    const handleUserTyping = ({ username: typingUser }) => {
      if (typingUser === username) return;
      setTypingUsers((prev) => Array.from(new Set([...prev, typingUser])));
    };

    const handleUserStoppedTyping = ({ username: typingUser }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
    };

    mobileSocket.on('new_message', handleNewMessage);
    mobileSocket.on('online_users', handleOnlineUsers);
    mobileSocket.on('user_typing', handleUserTyping);
    mobileSocket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      mobileSocket.off('connect', onConnect);
      mobileSocket.off('disconnect', onDisconnect);
      mobileSocket.off('connect_error', onConnectError);
      mobileSocket.off('new_message', handleNewMessage);
      mobileSocket.off('online_users', handleOnlineUsers);
      mobileSocket.off('user_typing', handleUserTyping);
      mobileSocket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [username, roomId, token, loadHistory]);

  const sendMessage = useCallback(
    async ({ content = '', mediaUrl = null, mediaType = null }) => {
      if (!content && !mediaUrl) return;
      const trimmed = typeof content === 'string' ? content.trim() : '';

      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        mobileSocket.emit('typing_stop', { username, roomId });
      }

      if (mobileSocket.connected) {
        mobileSocket.emit('send_message', {
          username,
          content: trimmed,
          mediaUrl,
          mediaType,
          roomId,
        });
      } else {
        const res = await sendMobileMessageApi({ username, content: trimmed, mediaUrl, mediaType, roomId }, token);
        if (res && res.data) {
          setMessages((prev) => [...prev, res.data]);
        }
      }
    },
    [username, roomId, token]
  );

  const handleInputChange = useCallback(() => {
    if (!username) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      mobileSocket.emit('typing_start', { username, roomId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      mobileSocket.emit('typing_stop', { username, roomId });
    }, 1500);
  }, [username, roomId]);

  return {
    messages,
    onlineUsers,
    typingUsers,
    connectionState,
    loading,
    error,
    reloadHistory: loadHistory,
    sendMessage,
    handleInputChange,
  };
};
