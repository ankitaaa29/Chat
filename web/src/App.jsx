import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

export function App() {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('chat_username') || '';
  });

  const handleLogin = (name) => {
    localStorage.setItem('chat_username', name);
    setUsername(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    setUsername('');
  };

  if (!username) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <ChatPage username={username} onLogout={handleLogout} />;
}

export default App;
