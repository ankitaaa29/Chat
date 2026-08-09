import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from '../components/ChatHeader';
import { UserList } from '../components/UserList';
import { MessageList } from '../components/MessageList';
import { TypingIndicator } from '../components/TypingIndicator';
import { MessageInput } from '../components/MessageInput';
import { disconnectSocket } from '../services/socket';

export const ChatPage = ({ username, token, onLogout }) => {
  const [roomId, setRoomId] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      </div>

      <div className="chat-layout">
        {/* Left Sidebar - Online Members Roster */}
        <UserList
          onlineUsers={onlineUsers}
          currentUsername={username}
          isOpen={sidebarOpen}
        />

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
            roomId={roomId}
            connectionState={connectionState}
            onlineCount={onlineUsers.length}
            onLogout={handleSignOut}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
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
