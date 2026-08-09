import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a display username');
      return;
    }
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    setError('');
    onLogin(trimmed);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>💬</Text>
          </View>

          <Text style={styles.title}>PulseChat</Text>
          <Text style={styles.subtitle}>
            Enter your display name to join real-time chat rooms instantly.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) setError('');
              }}
              placeholder="e.g. Rahul"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Enter Chat Room</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#131927',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#1A2234',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
