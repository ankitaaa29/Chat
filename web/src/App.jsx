import React, { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';

export function App() {
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  const [token, setToken] = useState(() => {
    return localStorage.getItem('chat_token') || '';
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('chat_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('chat_token', newToken);
    localStorage.setItem('chat_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    localStorage.removeItem('chat_username');
    setToken('');
    setUser(null);
    setAuthView('login');
  };

  if (!token || !user) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onRegisterSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleAuthSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  return <ChatPage username={user.username} user={user} token={token} onLogout={handleLogout} />;
}

export default App;
