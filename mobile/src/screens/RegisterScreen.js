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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { registerMobileApi } from '../services/api';

export const RegisterScreen = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUser || !trimmedEmail || !password) {
      setError('All fields are required');
      return;
    }

    if (trimmedUser.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await registerMobileApi({ username: trimmedUser, email: trimmedEmail, password });
      if (res && res.data) {
        onRegisterSuccess(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>💬</Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Register for PulseChat real-time secure messaging.
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(t) => { setUsername(t); setError(''); }}
                placeholder="e.g. Rahul"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                placeholder="rahul@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton} onPress={onSwitchToLogin}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#131927',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#1A2234',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 46,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 18,
  },
  switchText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  switchHighlight: {
    color: '#6366F1',
    fontWeight: '700',
  },
});
