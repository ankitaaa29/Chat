import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { LoginScreen } from './src/screens/LoginScreen';
import { ChatScreen } from './src/screens/ChatScreen';

export default function App() {
  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!username ? (
        <LoginScreen onLogin={(name) => setUsername(name)} />
      ) : (
        <ChatScreen username={username} onLogout={() => setUsername('')} />
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
