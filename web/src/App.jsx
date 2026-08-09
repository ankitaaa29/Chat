import React, { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

export function App() {
  const [token, setToken] = useState(localStorage.getItem('chat_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chat_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState(token ? 'dashboard' : 'login');

  useEffect(() => {
    if (token) {
      setView('dashboard');
    } else {
      setView('login');
    }
  }, [token]);

  const handleLoginSuccess = (newToken, userData) => {
    localStorage.setItem('chat_token', newToken);
    localStorage.setItem('chat_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setView('dashboard');
  };

  const handleRegisterSuccess = (newToken, userData) => {
    localStorage.setItem('chat_token', newToken);
    localStorage.setItem('chat_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    setToken(null);
    setUser(null);
    setView('login');
  };

  if (view === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setView('register')}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <DashboardPage
      username={user ? user.username : 'User'}
      user={user}
      token={token}
      onLogout={handleLogout}
    />
  );
}

export default App;
