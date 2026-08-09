import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

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
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
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
        <DashboardScreen username={user.username} user={user} token={token} onLogout={handleLogout} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070F',
  },
});
