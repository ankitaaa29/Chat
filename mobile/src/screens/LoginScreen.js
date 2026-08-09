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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { loginMobileApi, getBackendUrl, setCustomBackendUrl } from '../services/api';

export const LoginScreen = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(getBackendUrl());

  const handleSubmit = async () => {
    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setError('Please enter your email/username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await loginMobileApi({ identifier: trimmed, password });
      if (res && res.data) {
        onLoginSuccess(res.data.token, res.data.user);
      }
    } catch (err) {
      if (err.message && err.message.includes('Network request failed')) {
        setError('Network request failed. Make sure phone and PC are on same Wi-Fi.');
        setShowServerConfig(true);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyServerUrl = (urlToSet) => {
    const target = urlToSet || customServerUrl;
    setCustomBackendUrl(target);
    setCustomServerUrl(target);
    Alert.alert('Server IP Updated', `Connecting to: ${target}`);
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
            Sign in to access your secure chat workspace.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Network Connection Helper & IP Configurator */}
          {(showServerConfig || (error && error.includes('Network'))) && (
            <View style={styles.serverConfigPanel}>
              <Text style={styles.serverConfigTitle}>⚙ Backend Connection Settings</Text>
              <Text style={styles.serverConfigSub}>
                Connecting to: <Text style={styles.boldText}>{customServerUrl}</Text>
              </Text>

              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleApplyServerUrl('http://192.168.1.5:5000')}
                >
                  <Text style={styles.presetChipText}>PC Wi-Fi (192.168.1.5)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleApplyServerUrl('http://10.0.2.2:5000')}
                >
                  <Text style={styles.presetChipText}>Emulator (10.0.2.2)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.customIpRow}>
                <TextInput
                  style={styles.customIpInput}
                  value={customServerUrl}
                  onChangeText={setCustomServerUrl}
                  placeholder="e.g. http://192.168.1.5:5000"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => handleApplyServerUrl()}
                >
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL OR USERNAME</Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError('');
              }}
              placeholder="e.g. ankita@gmail.com or Ankita"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError('');
              }}
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
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleServerBtn}
            onPress={() => setShowServerConfig((prev) => !prev)}
          >
            <Text style={styles.toggleServerText}>
              {showServerConfig ? 'Hide Server IP Settings' : '⚙ Configure Server IP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={onSwitchToRegister}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchHighlight}>Register Now</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070F',
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
    backgroundColor: '#0D1224',
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoBadge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
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
    marginBottom: 18,
    lineHeight: 18,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#121930',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  serverConfigPanel: {
    width: '100%',
    backgroundColor: '#121930',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  serverConfigTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A855F7',
    marginBottom: 4,
  },
  serverConfigSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  boldText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  presetChipText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
  },
  customIpRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customIpInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#0D1224',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#F8FAFC',
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  applyBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  toggleServerBtn: {
    marginTop: 12,
    paddingVertical: 4,
  },
  toggleServerText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 16,
  },
  switchText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  switchHighlight: {
    color: '#A855F7',
    fontWeight: '700',
  },
});
