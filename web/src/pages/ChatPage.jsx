import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from '../components/ChatHeader';
import { UserList } from '../components/UserList';
import { MessageList } from '../components/MessageList';
import { TypingIndicator } from '../components/TypingIndicator';
import { MessageInput } from '../components/MessageInput';
import { CallModal } from '../components/CallModal';
import { socket, disconnectSocket } from '../services/socket';

export const ChatPage = ({ username, user, token, onLogout }) => {
  const [roomId, setRoomId] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // WebRTC Call State
  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    callerName: '',
    callType: 'video', // 'audio' | 'video'
    callerSocketId: null,
    from: null,
    offer: null,
    userToCall: null,
    roomId: 'general',
  });

  const { connectionState } = useSocket();
  const {
    messages,
    onlineUsers,
    typingUsers,
    loading,
    error,
    reloadHistory,
    sendMessage,
    handleInputChange,
  } = useChat(username, roomId);

  // Listen for incoming call event from Socket.io
  useEffect(() => {
    const handleIncomingCall = (data) => {
      setCallState({
        isCalling: false,
        isReceivingCall: true,
        callerName: data.callerName || 'Channel Member',
        callType: data.callType || 'video',
        from: data.from,
        offer: data.offer,
        roomId: data.roomId || 'general',
      });
    };

    socket.on('incoming_call', handleIncomingCall);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
    };
  }, []);

  const handleStartCall = (type = 'video') => {
    setCallState({
      isCalling: true,
      isReceivingCall: false,
      callerName: username,
      callType: type,
      userToCall: null,
      roomId,
    });
  };

  const handleCloseCall = () => {
    setCallState({
      isCalling: false,
      isReceivingCall: false,
      callerName: '',
      callType: 'video',
      callerSocketId: null,
      from: null,
      offer: null,
      userToCall: null,
      roomId,
    });
  };

  const handleSignOut = () => {
    disconnectSocket();
    onLogout();
  };

  const isDisconnected = connectionState === 'offline';

  return (
    <div className="app-container">
      {/* Ambient Animated Mesh Background */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* WebRTC Voice & Video Call Modal */}
      <CallModal
        callState={callState}
        onCloseCall={handleCloseCall}
        currentUsername={username}
      />

      <div className="chat-layout">
        {/* Left Sidebar - Online Members Roster */}
        <UserList
          onlineUsers={onlineUsers}
          currentUsername={username}
          isOpen={sidebarOpen}
        />

        {/* Mobile Backdrop Overlay when sidebar is open */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 40,
            }}
          />
        )}

        {/* Main Chat Stream Container */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'transparent',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Header */}
          <ChatHeader
            username={username}
            user={user}
            roomId={roomId}
            onRoomChange={(newRoom) => setRoomId(newRoom)}
            connectionState={connectionState}
            onlineCount={onlineUsers.length}
            onLogout={handleSignOut}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onStartCall={handleStartCall}
          />

          {/* Message Stream */}
          <MessageList
            messages={messages}
            currentUsername={username}
            loading={loading}
            error={error}
            onRetry={reloadHistory}
          />

          {/* Typing Bar */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Input Controller */}
          <MessageInput
            onSendMessage={sendMessage}
            onInputChange={handleInputChange}
            disabled={isDisconnected}
          />
        </main>
      </div>
    </div>
  );
};
