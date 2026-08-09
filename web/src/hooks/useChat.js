import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchChatHistory, sendMessageApi } from '../services/api';
import { socket, connectSocket } from '../services/socket';

export const useChat = (username, roomId = 'general') => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Load chat history via REST API
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchChatHistory(roomId);
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setError(err.message || 'Unable to connect to chat server');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!username) return;

    loadHistory();
    connectSocket(username, roomId);

    // Socket Event Handlers
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // De-duplicate if message already exists
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleUserTyping = ({ username: typingUser }) => {
      if (typingUser === username) return;
      setTypingUsers((prev) => new Set(prev).add(typingUser));
    };

    const handleUserStoppedTyping = ({ username: typingUser }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(typingUser);
        return next;
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [username, roomId, loadHistory]);

  // Send message via Socket.io with REST fallback
  const sendMessage = useCallback(
    async (content) => {
      if (!content || !content.trim()) return;

      const trimmedContent = content.trim();

      // Stop typing immediately when message is sent
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit('typing_stop', { username, roomId });
      }

      if (socket.connected) {
        socket.emit('send_message', {
          username,
          content: trimmedContent,
          roomId,
        });
      } else {
        // Fallback to REST API if socket is temporarily disconnected
        try {
          const res = await sendMessageApi({ username, content: trimmedContent, roomId });
          if (res && res.data) {
            setMessages((prev) => [...prev, res.data]);
          }
        } catch (err) {
          throw new Error('Failed to send message. Please check connection.');
        }
      }
    },
    [username, roomId]
  );

  // Debounced Typing Indicators
  const handleInputChange = useCallback(() => {
    if (!username) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing_start', { username, roomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing_stop', { username, roomId });
    }, 1500);
  }, [username, roomId]);

  return {
    messages,
    onlineUsers,
    typingUsers: Array.from(typingUsers),
    loading,
    error,
    reloadHistory: loadHistory,
    sendMessage,
    handleInputChange,
  };
};
