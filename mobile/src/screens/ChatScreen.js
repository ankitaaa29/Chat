import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useMobileChat } from '../hooks/useMobileChat';
import { MessageItem } from '../components/MessageItem';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { TypingBar } from '../components/TypingBar';
import { disconnectMobileSocket } from '../services/socket';

export const ChatScreen = ({ username, onLogout }) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const {
    messages,
    onlineUsers,
    typingUsers,
    connectionState,
    loading,
    error,
    reloadHistory,
    sendMessage,
    handleInputChange,
  } = useMobileChat(username, 'general');

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleExit = () => {
    disconnectMobileSocket();
    onLogout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        style={styles.flexContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}># general</Text>
            <ConnectionStatus state={connectionState} />
          </View>

          <View style={styles.headerRightGroup}>
            <Text style={styles.onlineText}>● {onlineUsers.length} Online</Text>
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Stream */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reloadHistory}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>Start the conversation 👋</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <MessageItem message={item} currentUsername={username} />
            )}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Typing Bar */}
        <TypingBar typingUsers={typingUsers} />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              handleInputChange();
            }}
            placeholder={connectionState === 'offline' ? 'Disconnected...' : 'Type a message...'}
            placeholderTextColor="#64748B"
            editable={connectionState !== 'offline'}
            multiline={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || connectionState === 'offline') ? styles.sendButtonDisabled : null,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || connectionState === 'offline'}
          >
            <Text style={styles.sendButtonText}>➤</Text>
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
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#131927',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  exitButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 8,
  },
  exitText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorSub: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
  },
  listContent: {
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#131927',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#1A2234',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 2,
  },
});
