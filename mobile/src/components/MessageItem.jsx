import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatMobileTime, getMobileInitials, getMobileAvatarColor } from '../utils/helpers';

export const MessageItem = ({ message, currentUsername }) => {
  const isSelf = message.username === currentUsername;
  const avatarColor = getMobileAvatarColor(message.username);

  return (
    <View style={[styles.container, isSelf ? styles.selfContainer : styles.otherContainer]}>
      {!isSelf && (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{getMobileInitials(message.username)}</Text>
        </View>
      )}

      <View style={[styles.wrapper, isSelf ? styles.alignRight : styles.alignLeft]}>
        {!isSelf && <Text style={styles.usernameText}>{message.username}</Text>}

        <View style={[styles.bubble, isSelf ? styles.selfBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isSelf ? styles.selfMessageText : styles.otherMessageText]}>
            {message.content}
          </Text>
        </View>

        <Text style={styles.timestampText}>{formatMobileTime(message.createdAt)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'flex-end',
  },
  selfContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  wrapper: {
    maxWidth: '78%',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  usernameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  selfBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  selfMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#F8FAFC',
  },
  timestampText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    marginHorizontal: 4,
  },
});
