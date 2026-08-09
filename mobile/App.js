import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ChatScreen } from './src/screens/ChatScreen';

export default function App() {
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setAuthView('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!token || !user ? (
        authView === 'register' ? (
          <RegisterScreen
            onRegisterSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        ) : (
          <LoginScreen
            onLoginSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        )
      ) : (
        <ChatScreen username={user.username} user={user} token={token} onLogout={handleLogout} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
});
