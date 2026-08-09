import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from '../components/ChatHeader';
import { UserList } from '../components/UserList';
import { MessageList } from '../components/MessageList';
import { TypingIndicator } from '../components/TypingIndicator';
import { MessageInput } from '../components/MessageInput';
import { disconnectSocket } from '../services/socket';

export const ChatPage = ({ username, onLogout }) => {
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
      <div className="chat-layout">
        {/* Left Sidebar - Online Users */}
        <UserList
          onlineUsers={onlineUsers}
          currentUsername={username}
          isOpen={sidebarOpen}
        />

        {/* Main Chat Container */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--bg-dark)',
            position: 'relative',
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

          {/* Message List Stream */}
          <MessageList
            messages={messages}
            currentUsername={username}
            loading={loading}
            error={error}
            onRetry={reloadHistory}
          />

          {/* Typing Indicator Bar */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Bottom Message Input Form */}
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
