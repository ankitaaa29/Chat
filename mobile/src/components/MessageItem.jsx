import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { formatMobileTime, getMobileInitials, getMobileAvatarColor } from '../utils/helpers';
import { getBackendUrl } from '../services/api';

export const MessageItem = ({ message, currentUsername, currentUserId }) => {
  const senderUsername = message.sender?.username || message.username || 'User';
  const senderId = message.senderId || message.sender?.id;

  const isSelf =
    (currentUserId && senderId === currentUserId) ||
    (currentUsername && senderUsername.toLowerCase() === currentUsername.toLowerCase());

  const avatarColor = getMobileAvatarColor(senderUsername);

  const baseUrl = getBackendUrl();
  const mediaFullUrl = message.mediaUrl
    ? message.mediaUrl.startsWith('http')
      ? message.mediaUrl
      : `${baseUrl}${message.mediaUrl.startsWith('/') ? '' : '/'}${message.mediaUrl}`
    : null;

  return (
    <View style={[styles.container, isSelf ? styles.selfContainer : styles.otherContainer]}>
      {!isSelf && (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{getMobileInitials(senderUsername)}</Text>
        </View>
      )}

      <View style={[styles.wrapper, isSelf ? styles.alignRight : styles.alignLeft]}>
        {!isSelf && <Text style={styles.usernameText}>{senderUsername}</Text>}

        <View style={[styles.bubble, isSelf ? styles.selfBubble : styles.otherBubble]}>
          {mediaFullUrl && (
            <Image
              source={{ uri: mediaFullUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          )}

          {message.content ? (
            <Text style={[styles.messageText, isSelf ? styles.selfMessageText : styles.otherMessageText]}>
              {message.content}
            </Text>
          ) : null}
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
    marginHorizontal: 14,
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  selfBubble: {
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#121930',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  mediaImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
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
    marginTop: 4,
    marginHorizontal: 4,
  },
});
