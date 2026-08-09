import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  searchMobileUsersApi,
  sendMobileContactRequestApi,
  fetchMobileReceivedRequestsApi,
  fetchMobileSentRequestsApi,
  acceptMobileContactRequestApi,
  rejectMobileContactRequestApi,
  fetchMobileContactsApi,
  fetchMobileConversationsApi,
  fetchMobileConversationMessagesApi,
  sendMobileConversationMessageApi,
  uploadMobileFileApi,
} from '../services/api';
import { mobileSocket, connectMobileSocket, disconnectMobileSocket } from '../services/socket';
import { MessageItem } from '../components/MessageItem';
import { CallModal } from '../components/CallModal';
import { getMobileInitials, getMobileAvatarColor, formatMobileTime } from '../utils/helpers';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '💯', '👋'];

export const DashboardScreen = ({ username, user, token, onLogout }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chats' | 'contacts' | 'requests' | 'search' | 'settings'

  // Data States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Active Chat State
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState(null); // { uri, url, type }
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Calling Modal State
  const [callState, setCallState] = useState({
    visible: false,
    type: 'video',
    targetUser: 'Contact',
  });

  // Settings State
  const [bio, setBio] = useState('Active on PulseChat Mobile 👋');
  const [editingBio, setEditingBio] = useState('Active on PulseChat Mobile 👋');
  const [bioSuccessMessage, setBioSuccessMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Privacy & Notifications Toggles
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('Midnight Aurora');

  const flatListRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [recData, sentData, contactsData, convsData] = await Promise.all([
        fetchMobileReceivedRequestsApi(token).catch(() => ({ data: [] })),
        fetchMobileSentRequestsApi(token).catch(() => ({ data: [] })),
        fetchMobileContactsApi(token).catch(() => ({ data: [] })),
        fetchMobileConversationsApi(token).catch(() => ({ data: [] })),
      ]);

      setReceivedRequests(recData.data || []);
      setSentRequests(sentData.data || []);
      setContacts(contactsData.data || []);
      setConversations(convsData.data || []);
    } catch (err) {
      console.error('Error loading mobile data:', err);
    }
  }, [token]);

  useEffect(() => {
    if (!username) return;

    loadData();
    connectMobileSocket(username, 'general', token);

    if (user && user.id) {
      mobileSocket.emit('register_user', { username, userId: user.id });
    }

    const handleContactRequestReceived = ({ request, senderName }) => {
      setReceivedRequests((prev) => [request, ...prev]);
      Alert.alert('New Request 🔔', `${senderName} sent you a contact request`);
    };

    const handleContactRequestAccepted = ({ acceptorName }) => {
      Alert.alert('Request Accepted 🎉', `${acceptorName} accepted your request`);
      loadData();
    };

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      loadData();
    };

    const handleIncomingCall = ({ from, callerName, callType }) => {
      setCallState({
        visible: true,
        type: callType || 'video',
        targetUser: callerName || 'Caller',
        isIncoming: true,
        callerSocketId: from,
      });
    };

    mobileSocket.on('contact_request_received', handleContactRequestReceived);
    mobileSocket.on('contact_request_accepted', handleContactRequestAccepted);
    mobileSocket.on('new_message', handleNewMessage);
    mobileSocket.on('incoming_call', handleIncomingCall);

    return () => {
      mobileSocket.off('contact_request_received', handleContactRequestReceived);
      mobileSocket.off('contact_request_accepted', handleContactRequestAccepted);
      mobileSocket.off('new_message', handleNewMessage);
      mobileSocket.off('incoming_call', handleIncomingCall);
    };
  }, [username, user, token, activeConversation, loadData]);

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await searchMobileUsersApi(searchQuery, token);
      setSearchResults(res.data || []);
    } catch (err) {
      Alert.alert('Search Error', err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await sendMobileContactRequestApi(receiverId, token);
      Alert.alert('Success', 'Contact request sent!');
      handleSearchSubmit();
      fetchMobileSentRequestsApi(token).then((res) => setSentRequests(res.data || []));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await acceptMobileContactRequestApi(requestId, token);
      Alert.alert('Success', 'Request accepted!');
      loadData();
      if (res.data && res.data.conversationId) {
        openConversation(res.data.conversationId);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectMobileContactRequestApi(requestId, token);
      Alert.alert('Declined', 'Request rejected');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reject request');
    }
  };

  const openConversation = async (conversationId, targetUser = null) => {
    try {
      setLoadingMessages(true);
      const conv = conversations.find((c) => c.id === conversationId);
      const otherUser = targetUser || (conv ? conv.otherUser : null);

      setActiveConversation({ id: conversationId, otherUser });
      setActiveTab('chats');

      mobileSocket.emit('join_conversation', { conversationId, userId: user ? user.id : null });

      const res = await fetchMobileConversationMessagesApi(conversationId, token);
      setMessages(res.data || []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Unable to open conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Gallery Photo Picker
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access photo gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setUploadingMedia(true);
        const uploaded = await uploadMobileFileApi(localUri, token);
        if (uploaded && uploaded.data) {
          setMediaAttachment({
            uri: localUri,
            url: uploaded.data.fileUrl,
            type: uploaded.data.mediaType,
          });
        }
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Photo upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Direct Camera Photo Capture
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setUploadingMedia(true);
        const uploaded = await uploadMobileFileApi(localUri, token);
        if (uploaded && uploaded.data) {
          setMediaAttachment({
            uri: localUri,
            url: uploaded.data.fileUrl,
            type: uploaded.data.mediaType,
          });
        }
      }
    } catch (err) {
      Alert.alert('Camera Error', err.message || 'Photo capture failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !mediaAttachment) || !activeConversation || uploadingMedia) return;

    try {
      const content = inputText.trim();
      const mediaUrl = mediaAttachment ? mediaAttachment.url : null;
      const mediaType = mediaAttachment ? mediaAttachment.type : null;

      setInputText('');
      setMediaAttachment(null);
      setShowEmojiPicker(false);

      const res = await sendMobileConversationMessageApi(
        activeConversation.id,
        { content, mediaUrl, mediaType },
        token
      );

      if (res && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      Alert.alert('Message Error', err.message || 'Failed to send message.');
    }
  };

  const handleSaveBio = () => {
    setBio(editingBio);
    setBioSuccessMessage('Bio updated successfully!');
    setTimeout(() => setBioSuccessMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }
    setPasswordMessage('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMessage(''), 3000);
  };

  const startVoiceCall = () => {
    const target = activeConversation?.otherUser?.username || 'Contact';
    setCallState({ visible: true, type: 'audio', targetUser: target, isIncoming: false });
    mobileSocket.emit('call_user', {
      userToCall: target,
      callType: 'audio',
      conversationId: activeConversation?.id,
      callerName: username,
    });
  };

  const startVideoCall = () => {
    const target = activeConversation?.otherUser?.username || 'Contact';
    setCallState({ visible: true, type: 'video', targetUser: target, isIncoming: false });
    mobileSocket.emit('call_user', {
      userToCall: target,
      callType: 'video',
      conversationId: activeConversation?.id,
      callerName: username,
    });
  };

  const topInsetPadding = Math.max(insets.top, 16);
  const bottomTabBarPadding = Math.max(insets.bottom, 12);

  return (
    <View style={styles.safeArea}>
      {/* Interactive WebRTC Calling Screen Modal */}
      <CallModal
        visible={callState.visible}
        callType={callState.type}
        targetUser={callState.targetUser}
        isIncoming={callState.isIncoming}
        onEndCall={() => {
          mobileSocket.emit('end_call', { conversationId: activeConversation?.id });
          setCallState({ visible: false, type: 'video', targetUser: 'Contact', isIncoming: false });
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        {/* Main Content Area */}
        <View style={styles.mainContainer}>
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}>
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Welcome, {username} 👋</Text>
                <Text style={styles.welcomeSub}>Encrypted private messaging workspace.</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>CONTACTS</Text>
                  <Text style={styles.statValue}>{contacts.length}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>REQUESTS</Text>
                  <Text style={[styles.statValue, receivedRequests.length > 0 ? styles.pinkText : null]}>
                    {receivedRequests.length}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>CHATS</Text>
                  <Text style={styles.statValue}>{conversations.length}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.searchLaunchCard}
                onPress={() => setActiveTab('search')}
                activeOpacity={0.85}
              >
                <Text style={styles.launchTitle}>🔍 Find & Connect with Friends</Text>
                <Text style={styles.launchSub}>Search users by username to send contact requests.</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* TAB 2: SEARCH */}
          {activeTab === 'search' && (
            <View style={[styles.paddingContainer, { paddingTop: topInsetPadding }]}>
              <Text style={styles.screenTitle}>Find Users</Text>
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search username... (e.g. rahul)"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearchSubmit}>
                  <Text style={styles.searchBtnText}>{searching ? '...' : 'Search'}</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userRowCard}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.avatar, { backgroundColor: getMobileAvatarColor(item.username) }]}>
                        <Text style={styles.avatarText}>{getMobileInitials(item.username)}</Text>
                      </View>
                      <View>
                        <Text style={styles.rowTitle}>{item.username}</Text>
                        <Text style={styles.rowSub}>@{item.username.toLowerCase()}</Text>
                      </View>
                    </View>

                    {item.relationshipState === 'ACCEPTED' ? (
                      <TouchableOpacity
                        style={styles.actionBtnAccepted}
                        onPress={() => {
                          const conv = conversations.find((c) => c.otherUser && c.otherUser.id === item.id);
                          if (conv) openConversation(conv.id, item);
                          else setActiveTab('contacts');
                        }}
                      >
                        <Text style={styles.actionBtnTextAccepted}>Message</Text>
                      </TouchableOpacity>
                    ) : item.relationshipState === 'PENDING_SENT' ? (
                      <Text style={styles.badgeSent}>Request Sent</Text>
                    ) : item.relationshipState === 'PENDING_RECEIVED' ? (
                      <TouchableOpacity
                        style={styles.actionBtnAccept}
                        onPress={() => handleAcceptRequest(item.requestId)}
                      >
                        <Text style={styles.actionBtnTextWhite}>Accept</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionBtnAdd}
                        onPress={() => handleSendRequest(item.id)}
                      >
                        <Text style={styles.actionBtnTextWhite}>+ Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            </View>
          )}

          {/* TAB 3: REQUESTS */}
          {activeTab === 'requests' && (
            <View style={[styles.paddingContainer, { paddingTop: topInsetPadding }]}>
              <Text style={styles.screenTitle}>Incoming Requests ({receivedRequests.length})</Text>
              <FlatList
                data={receivedRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userRowCard}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.avatar, { backgroundColor: getMobileAvatarColor(item.sender.username) }]}>
                        <Text style={styles.avatarText}>{getMobileInitials(item.sender.username)}</Text>
                      </View>
                      <View>
                        <Text style={styles.rowTitle}>{item.sender.username}</Text>
                        <Text style={styles.rowSub}>Wants to connect</Text>
                      </View>
                    </View>

                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.actionBtnReject} onPress={() => handleRejectRequest(item.id)}>
                        <Text style={styles.actionBtnTextReject}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnAccept} onPress={() => handleAcceptRequest(item.id)}>
                        <Text style={styles.actionBtnTextWhite}>Accept</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <View style={[styles.paddingContainer, { paddingTop: topInsetPadding }]}>
              <Text style={styles.screenTitle}>Accepted Contacts ({contacts.length})</Text>
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.userRowCard}>
                    <View style={styles.rowLeft}>
                      <View style={[styles.avatar, { backgroundColor: getMobileAvatarColor(item.username) }]}>
                        <Text style={styles.avatarText}>{getMobileInitials(item.username)}</Text>
                      </View>
                      <View>
                        <Text style={styles.rowTitle}>{item.username}</Text>
                        <Text style={[styles.rowSub, item.isOnline ? styles.greenText : null]}>
                          {item.isOnline ? '🟢 Online' : '⚪ Offline'}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.actionBtnAdd}
                      onPress={() => {
                        const conv = conversations.find((c) => c.otherUser && c.otherUser.id === item.id);
                        if (conv) openConversation(conv.id, item);
                      }}
                    >
                      <Text style={styles.actionBtnTextWhite}>Message</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          {/* TAB 5: CHATS */}
          {activeTab === 'chats' && (
            <View style={styles.flexContainer}>
              {activeConversation ? (
                <View style={styles.flexContainer}>
                  {/* Chat Top Header */}
                  <View style={[styles.chatHeaderBar, { paddingTop: topInsetPadding }]}>
                    <TouchableOpacity onPress={() => setActiveConversation(null)} style={styles.backBtn}>
                      <Text style={styles.backBtnText}>◀ Back</Text>
                    </TouchableOpacity>

                    <View style={styles.chatHeaderTitleContainer}>
                      <Text style={styles.chatHeaderTitle}>
                        {activeConversation.otherUser ? activeConversation.otherUser.username : 'Private Chat'}
                      </Text>
                      <Text style={styles.encryptedSub}>🔒 End-to-End Encrypted</Text>
                    </View>

                    {/* Audio & Video Call Action Buttons */}
                    <View style={styles.callButtonsRow}>
                      <TouchableOpacity style={styles.callIconBtn} onPress={startVoiceCall}>
                        <Text style={styles.callIconText}>📞</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.callIconBtn} onPress={startVideoCall}>
                        <Text style={styles.callIconText}>📹</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Message Stream */}
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item }) => (
                      <MessageItem
                        message={item}
                        currentUsername={username}
                        currentUserId={user ? user.id : null}
                      />
                    )}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  />

                  {/* Emoji Quick Picker */}
                  {showEmojiPicker && (
                    <View style={styles.emojiPickerBar}>
                      {QUICK_EMOJIS.map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={styles.emojiChip}
                          onPress={() => setInputText((prev) => prev + emoji)}
                        >
                          <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Media Preview Attachment Bar */}
                  {uploadingMedia ? (
                    <View style={styles.mediaPreviewBar}>
                      <ActivityIndicator color="#8B5CF6" size="small" />
                      <Text style={styles.mediaPreviewText}>Uploading photo...</Text>
                    </View>
                  ) : mediaAttachment ? (
                    <View style={styles.mediaPreviewBar}>
                      <Image source={{ uri: mediaAttachment.uri }} style={styles.mediaPreviewThumb} />
                      <Text style={styles.mediaPreviewText}>Photo attached</Text>
                      <TouchableOpacity onPress={() => setMediaAttachment(null)}>
                        <Text style={styles.removeMediaText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* Message Input Bar */}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => setShowEmojiPicker((prev) => !prev)}
                    >
                      <Text style={styles.iconBtnText}>😊</Text>
                    </TouchableOpacity>

                    {/* Camera Capture Button */}
                    <TouchableOpacity style={styles.iconBtn} onPress={handleTakePhoto}>
                      <Text style={styles.iconBtnText}>📸</Text>
                    </TouchableOpacity>

                    {/* Photo Gallery Picker Button */}
                    <TouchableOpacity style={styles.iconBtn} onPress={handlePickImage}>
                      <Text style={styles.iconBtnText}>📷</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.textInput}
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Type a message..."
                      placeholderTextColor="#64748B"
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                      <Text style={styles.sendButtonText}>➤</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.paddingContainer, { paddingTop: topInsetPadding }]}>
                  <Text style={styles.screenTitle}>Private Conversations</Text>
                  <FlatList
                    data={conversations}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const other = item.otherUser || { username: 'Contact' };
                      return (
                        <TouchableOpacity
                          style={styles.userRowCard}
                          onPress={() => openConversation(item.id, other)}
                        >
                          <View style={styles.rowLeft}>
                            <View style={[styles.avatar, { backgroundColor: getMobileAvatarColor(other.username) }]}>
                              <Text style={styles.avatarText}>{getMobileInitials(other.username)}</Text>
                            </View>
                            <View>
                              <Text style={styles.rowTitle}>{other.username}</Text>
                              <Text style={styles.rowSub}>
                                {item.lastMessage ? item.lastMessage.content || '📷 Photo attachment' : 'Start conversation...'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: topInsetPadding }]}>
              <Text style={styles.screenTitle}>Account Settings</Text>

              {/* Profile Overview & Bio Editor */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsHeader}>👤 Profile Info</Text>
                <Text style={styles.settingsSub}>Username: {username}</Text>
                <Text style={styles.settingsSub}>Email: {user && user.email ? user.email : 'Member'}</Text>

                <Text style={styles.inputLabel}>BIO</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={editingBio}
                  onChangeText={setEditingBio}
                  placeholder="Enter your personal bio..."
                  placeholderTextColor="#64748B"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBio}>
                  <Text style={styles.saveBtnText}>Save Profile Bio</Text>
                </TouchableOpacity>
                {bioSuccessMessage ? <Text style={styles.successText}>{bioSuccessMessage}</Text> : null}
              </View>

              {/* Password Change Form */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsHeader}>🔒 Password & Security</Text>

                <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>NEW PASSWORD</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                />

                <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.settingsInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handlePasswordChange}>
                  <Text style={styles.saveBtnText}>Update Password</Text>
                </TouchableOpacity>
                {passwordMessage ? (
                  <Text style={passwordMessage.includes('successfully') ? styles.successText : styles.errorText}>
                    {passwordMessage}
                  </Text>
                ) : null}
              </View>

              {/* Privacy & Notification Settings */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsHeader}>🛡 Privacy Controls</Text>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Show Online Status</Text>
                  <Switch
                    value={showOnlineStatus}
                    onValueChange={setShowOnlineStatus}
                    trackColor={{ false: '#334155', true: '#8B5CF6' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Read Receipts</Text>
                  <Switch
                    value={showReadReceipts}
                    onValueChange={setShowReadReceipts}
                    trackColor={{ false: '#334155', true: '#8B5CF6' }}
                  />
                </View>
              </View>

              <View style={styles.settingsCard}>
                <Text style={styles.settingsHeader}>🔔 Notifications</Text>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>In-App Sound Alerts</Text>
                  <Switch
                    value={enableSoundAlerts}
                    onValueChange={setEnableSoundAlerts}
                    trackColor={{ false: '#334155', true: '#8B5CF6' }}
                  />
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Push Notifications</Text>
                  <Switch
                    value={enablePushNotifications}
                    onValueChange={setEnablePushNotifications}
                    trackColor={{ false: '#334155', true: '#8B5CF6' }}
                  />
                </View>
              </View>

              {/* Appearance Theme Selector */}
              <View style={styles.settingsCard}>
                <Text style={styles.settingsHeader}>🎨 Theme & Appearance</Text>
                <View style={styles.themeRow}>
                  {['Midnight Aurora', 'Obsidian Black', 'Cyberpunk Pink'].map((themeName) => (
                    <TouchableOpacity
                      key={themeName}
                      style={[
                        styles.themeChip,
                        selectedTheme === themeName ? styles.themeChipActive : null,
                      ]}
                      onPress={() => setSelectedTheme(themeName)}
                    >
                      <Text
                        style={[
                          styles.themeChipText,
                          selectedTheme === themeName ? styles.themeChipTextActive : null,
                        ]}
                      >
                        {themeName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Native Bottom Tab Bar with Inset Safety */}
        <View style={[styles.bottomTabBar, { paddingBottom: bottomTabBarPadding }]}>
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'chats', label: 'Chats', icon: '💬' },
            { id: 'contacts', label: 'Contacts', icon: '👥' },
            { id: 'requests', label: 'Requests', icon: '🔔', badge: receivedRequests.length },
            { id: 'search', label: 'Search', icon: '🔍' },
            { id: 'settings', label: 'Settings', icon: '⚙' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'chats') setActiveConversation(null);
              }}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.id ? styles.tabLabelActive : null]}>
                {tab.label}
              </Text>
              {tab.badge ? (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#05070F',
  },
  flexContainer: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  paddingContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  welcomeCard: {
    backgroundColor: '#0D1224',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#94A3B8',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0D1224',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pinkText: {
    color: '#EC4899',
  },
  greenText: {
    color: '#10B981',
  },
  searchLaunchCard: {
    backgroundColor: '#121930',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  launchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  launchSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#0D1224',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  userRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1224',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  rowSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtnAdd: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnAccept: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  actionBtnAccepted: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  actionBtnTextWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnTextAccepted: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnTextReject: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 12,
  },
  badgeSent: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chatHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1224',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 13,
  },
  chatHeaderTitleContainer: {
    alignItems: 'center',
  },
  chatHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  encryptedSub: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 1,
  },
  callButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  callIconText: {
    fontSize: 14,
  },
  emojiPickerBar: {
    flexDirection: 'row',
    backgroundColor: '#0D1224',
    padding: 8,
    gap: 8,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
  },
  emojiChip: {
    padding: 6,
  },
  emojiText: {
    fontSize: 20,
  },
  mediaPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#121930',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
  },
  mediaPreviewThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  mediaPreviewText: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  removeMediaText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D1224',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
  },
  iconBtn: {
    padding: 4,
  },
  iconBtnText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#121930',
    borderRadius: 20,
    paddingHorizontal: 14,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  settingsCard: {
    backgroundColor: '#0D1224',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  settingsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  settingsSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  settingsInput: {
    height: 42,
    backgroundColor: '#121930',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
  },
  saveBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  successText: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  themeRow: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
  },
  themeChip: {
    backgroundColor: '#121930',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    alignItems: 'center',
  },
  themeChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  themeChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  themeChipTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0D1224',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: '25%',
    backgroundColor: '#EC4899',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
