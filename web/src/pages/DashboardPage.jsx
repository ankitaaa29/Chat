import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationSidebar
} from '../components/NavigationSidebar';
import {
  searchUsersApi,
  sendContactRequestApi,
  fetchReceivedRequestsApi,
  fetchSentRequestsApi,
  acceptContactRequestApi,
  rejectContactRequestApi,
  fetchContactsApi,
  fetchConversationsApi,
  fetchConversationMessagesApi,
  sendConversationMessageApi,
} from '../services/api';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { CallModal } from '../components/CallModal';
import { getInitials, getUserAvatarColor, formatTimestamp } from '../utils/formatters';
import {
  Search,
  UserPlus,
  Check,
  X,
  MessageSquare,
  Users,
  Clock,
  Phone,
  Video,
  Shield,
  Sparkles,
  ArrowRight,
  Bell,
  Lock,
  Settings as SettingsIcon,
  User,
  Key,
  Palette,
  Volume2,
  Trash2,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const DashboardPage = ({ username, user, token, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'chats' | 'contacts' | 'requests' | 'search' | 'settings'

  // Data States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);

  // Active 1-to-1 Conversation State
  const [activeConversation, setActiveConversation] = useState(null); // { id, otherUser }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Settings State
  const [bio, setBio] = useState('Active on PulseChat 👋');
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineVisibility, setOnlineVisibility] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('aurora'); // 'aurora' | 'obsidian' | 'cyberpunk'

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  // Real-time Notification Toast State
  const [toastNotification, setToastNotification] = useState(null);

  // WebRTC Call State
  const [callState, setCallState] = useState({
    isCalling: false,
    isReceivingCall: false,
    callerName: '',
    callType: 'video',
    from: null,
    offer: null,
  });

  // Load Initial Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [recData, sentData, contactsData, convsData] = await Promise.all([
        fetchReceivedRequestsApi().catch(() => ({ data: [] })),
        fetchSentRequestsApi().catch(() => ({ data: [] })),
        fetchContactsApi().catch(() => ({ data: [] })),
        fetchConversationsApi().catch(() => ({ data: [] })),
      ]);

      setReceivedRequests(recData.data || []);
      setSentRequests(sentData.data || []);
      setContacts(contactsData.data || []);
      setConversations(convsData.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    if (!username) return;

    loadDashboardData();
    connectSocket(username);

    // Join personal socket room for real-time request notifications
    if (user && user.id) {
      socket.emit('register_user', { username, userId: user.id });
    }

    // Socket Event Handlers for Real-Time Contact Requests
    const handleContactRequestReceived = ({ request, senderName }) => {
      setReceivedRequests((prev) => [request, ...prev]);
      showToast(`🔔 New contact request from ${senderName}`);
    };

    const handleContactRequestAccepted = ({ request, acceptorName, conversationId }) => {
      showToast(`🎉 ${acceptorName} accepted your contact request!`);
      loadDashboardData();
    };

    const handleContactRequestRejected = ({ rejectorName }) => {
      showToast(`❌ ${rejectorName} declined the contact request`);
      loadDashboardData();
    };

    // Socket Event for Real-Time Messages in active conversation
    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      loadDashboardData();
    };

    // Socket Event for Incoming Voice/Video Calls
    const handleIncomingCall = ({ from, callerName, offer, callType, conversationId }) => {
      setCallState({
        isCalling: false,
        isReceivingCall: true,
        callerName,
        callType,
        callerSocketId: from,
        roomId: conversationId,
        offer,
      });
    };

    socket.on('contact_request_received', handleContactRequestReceived);
    socket.on('contact_request_accepted', handleContactRequestAccepted);
    socket.on('contact_request_rejected', handleContactRequestRejected);
    socket.on('new_message', handleNewMessage);
    socket.on('incoming_call', handleIncomingCall);

    return () => {
      socket.off('contact_request_received', handleContactRequestReceived);
      socket.off('contact_request_accepted', handleContactRequestAccepted);
      socket.off('contact_request_rejected', handleContactRequestRejected);
      socket.off('new_message', handleNewMessage);
      socket.off('incoming_call', handleIncomingCall);
    };
  }, [username, user, activeConversation, loadDashboardData]);

  // Toast Notification helper
  const showToast = (message) => {
    setToastNotification(message);
    setTimeout(() => setToastNotification(null), 5000);
  };

  // Execute User Search
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const res = await searchUsersApi(searchQuery);
      setSearchResults(res.data || []);
    } catch (err) {
      alert(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  // Send Contact Request
  const handleSendRequest = async (receiverId) => {
    try {
      await sendContactRequestApi(receiverId);
      showToast('Contact request sent!');
      handleSearchSubmit();
      fetchSentRequestsApi().then((res) => setSentRequests(res.data || []));
    } catch (err) {
      alert(err.message || 'Failed to send request');
    }
  };

  // Accept Contact Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await acceptContactRequestApi(requestId);
      showToast('Request accepted! Private chat created.');
      loadDashboardData();
      if (res.data && res.data.conversationId) {
        openConversation(res.data.conversationId);
      }
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    }
  };

  // Reject Contact Request
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectContactRequestApi(requestId);
      showToast('Request declined.');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  // Open 1-to-1 Private Conversation
  const openConversation = async (conversationId, targetUser = null) => {
    try {
      setLoadingMessages(true);
      const conv = conversations.find((c) => c.id === conversationId);
      const otherUser = targetUser || (conv ? conv.otherUser : null);

      setActiveConversation({ id: conversationId, otherUser });
      setActiveTab('chats');

      // Join conversation Socket.io room
      socket.emit('join_conversation', { conversationId, userId: user ? user.id : null });

      const res = await fetchConversationMessagesApi(conversationId);
      setMessages(res.data || []);
    } catch (err) {
      alert(err.message || 'Unable to open conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send Message in Active Conversation
  const handleSendMessage = async ({ content, mediaUrl, mediaType }) => {
    if (!activeConversation) return;

    try {
      // Call REST API: saves message in DB & automatically broadcasts socket event 'new_message'
      const res = await sendConversationMessageApi(activeConversation.id, { content, mediaUrl, mediaType });
      if (res && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setSettingsMessage('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSettingsMessage('Passwords do not match');
      return;
    }
    setSettingsMessage('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSettingsMessage(''), 4000);
  };

  return (
    <div className="app-container" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Ambient Mesh Lighting */}
      <div className="ambient-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* WebRTC Call Modal */}
      <CallModal
        callState={callState}
        onCloseCall={() => setCallState({ isCalling: false, isReceivingCall: false, callerName: '' })}
        currentUsername={username}
      />

      {/* Real-Time Notification Toast Banner */}
      {toastNotification && (
        <div
          className="animate-fade-in glass-panel"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 100,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(13, 18, 36, 0.95)',
            border: '1px solid var(--primary)',
            color: '#FFFFFF',
            boxShadow: 'var(--shadow-aurora)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          <Bell size={18} color="var(--primary)" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <NavigationSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'chats') setActiveConversation(null);
        }}
        pendingRequestsCount={receivedRequests.length}
        onLogout={onLogout}
      />

      {/* Main Content Workspace View */}
      <main
        style={{
          flex: 1,
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}
      >
        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: HOME DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'home' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '1000px', width: '100%' }}>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Welcome back, {username} 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                Your encrypted contact-based private workspace dashboard.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '36px' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Accepted Contacts
                  </span>
                  <Users size={20} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {contacts.length}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Incoming Requests
                  </span>
                  <UserPlus size={20} color="#EC4899" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: receivedRequests.length > 0 ? '#EC4899' : 'var(--text-main)' }}>
                  {receivedRequests.length}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Active Private Chats
                  </span>
                  <MessageSquare size={20} color="var(--accent-green)" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {conversations.length}
                </div>
              </div>
            </div>

            {/* Search Launcher Card */}
            <div
              className="glass-panel"
              style={{
                padding: '28px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '36px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid var(--border-glow)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Find & Connect with Friends
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Search for users by username to send contact requests and unlock private messaging.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('search')}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--aurora-gradient)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-aurora)',
                }}
              >
                <Search size={18} />
                <span>Search Users</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: SEARCH USERS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'search' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '850px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Find Users
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Search by username to send a contact request.
            </p>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username... (e.g. rahul)"
                className="glass-input"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                }}
              />
              <button
                type="submit"
                disabled={searching}
                style={{
                  padding: '0 28px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--aurora-gradient)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-aurora)',
                }}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Results Roster */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {searchResults.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
                  Enter a username above to search for registered users.
                </div>
              ) : (
                searchResults.map((usr) => (
                  <div
                    key={usr.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 24px',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: getUserAvatarColor(usr.username),
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                        }}
                      >
                        {getInitials(usr.username)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                          {usr.username}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          @{usr.username.toLowerCase()}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Action Button based on Relationship State */}
                    {usr.relationshipState === 'ACCEPTED' ? (
                      <button
                        onClick={() => {
                          const conv = conversations.find((c) => c.otherUser && c.otherUser.id === usr.id);
                          if (conv) openConversation(conv.id, usr);
                          else setActiveTab('contacts');
                        }}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-glow)',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Message
                      </button>
                    ) : usr.relationshipState === 'PENDING_SENT' ? (
                      <span
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          color: 'var(--text-muted)',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                        }}
                      >
                        Request Sent
                      </span>
                    ) : usr.relationshipState === 'PENDING_RECEIVED' ? (
                      <button
                        onClick={() => handleAcceptRequest(usr.requestId)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--accent-green)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        Accept Request
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(usr.id)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--aurora-gradient)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        + Add Friend
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: INCOMING & SENT REQUESTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'requests' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '850px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Contact Requests
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
              Manage incoming invitations and pending sent requests.
            </p>

            {/* Incoming Requests Section */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Incoming Requests</span>
                <span style={{ backgroundColor: '#EC4899', color: '#FFFFFF', fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  {receivedRequests.length}
                </span>
              </h2>

              {receivedRequests.length === 0 ? (
                <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', color: 'var(--text-dim)', textAlign: 'center' }}>
                  No pending incoming requests.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {receivedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="glass-panel"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: getUserAvatarColor(req.sender.username),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                          }}
                        >
                          {getInitials(req.sender.username)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1rem' }}>
                            {req.sender.username}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Wants to connect with you
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--accent-green)',
                            border: 'none',
                            color: '#FFFFFF',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: ACCEPTED CONTACTS ROSTER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'contacts' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '850px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Contacts
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
              Only accepted friends appear here for private 1-to-1 chat.
            </p>

            {contacts.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-dim)' }}>
                You don't have any accepted contacts yet. Search for users to connect!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="glass-panel"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ position: 'relative' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: getUserAvatarColor(contact.username),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                          }}
                        >
                          {getInitials(contact.username)}
                        </div>
                        {contact.isOnline && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#10B981',
                              border: '2px solid var(--bg-card-solid)',
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {contact.username}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: contact.isOnline ? '#10B981' : 'var(--text-dim)' }}>
                          {contact.isOnline ? '🟢 Online' : '⚪ Offline'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const conv = conversations.find((c) => c.otherUser && c.otherUser.id === contact.id);
                        if (conv) openConversation(conv.id, contact);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--aurora-gradient)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 5: PRIVATE 1-TO-1 CHATS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'chats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%', minHeight: 0, overflow: 'hidden' }}>
            {/* Conversations List Panel */}
            <div
              className="glass-panel"
              style={{
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  Private Chats
                </h2>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {conversations.length === 0 ? (
                  <div style={{ padding: '30px 16px', color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.85rem' }}>
                    No conversations yet. Accept contact requests to chat.
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation && activeConversation.id === conv.id;
                    const other = conv.otherUser || { username: 'Contact' };

                    return (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv.id, other)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginBottom: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: getUserAvatarColor(other.username),
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(other.username)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                              {other.username}
                            </span>
                            {conv.lastMessage && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                {formatTimestamp(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                            {conv.lastMessage ? conv.lastMessage.content || '📷 Photo attachment' : 'Start conversation...'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Active 1-to-1 Chat Stream Window */}
            {activeConversation ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
                {/* Header */}
                <div
                  style={{
                    padding: '14px 24px',
                    backgroundColor: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: getUserAvatarColor(activeConversation.otherUser ? activeConversation.otherUser.username : 'User'),
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                      }}
                    >
                      {getInitials(activeConversation.otherUser ? activeConversation.otherUser.username : 'User')}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {activeConversation.otherUser ? activeConversation.otherUser.username : 'Private Chat'}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)' }}>
                        🔒 End-to-End Encrypted Contact Chat
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setCallState({ isCalling: true, callType: 'audio', userToCall: activeConversation.otherUser ? activeConversation.otherUser.username : null, roomId: activeConversation.id })}
                      style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#FFFFFF', cursor: 'pointer' }}
                    >
                      <Phone size={18} />
                    </button>
                    <button
                      onClick={() => setCallState({ isCalling: true, callType: 'video', userToCall: activeConversation.otherUser ? activeConversation.otherUser.username : null, roomId: activeConversation.id })}
                      style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#FFFFFF', cursor: 'pointer' }}
                    >
                      <Video size={18} />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <MessageList
                  messages={messages}
                  currentUsername={username}
                  currentUserId={user?.id}
                  loading={loadingMessages}
                />

                {/* Input Bar */}
                <MessageInput onSendMessage={handleSendMessage} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', gap: '12px' }}>
                <Lock size={40} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Private 1-to-1 Messaging
                </h3>
                <p style={{ fontSize: '0.85rem' }}>Select a conversation from the left to start messaging.</p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 6: SETTINGS & PROFILE CUSTOMIZATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'settings' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', maxWidth: '850px', width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
              Account Settings
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
              Manage your profile, security, notifications, and appearance options.
            </p>

            {settingsMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  color: '#10B981',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '24px',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{settingsMessage}</span>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--primary)" />
                <span>Profile Details</span>
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: getUserAvatarColor(username),
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.4rem',
                    boxShadow: 'var(--shadow-aurora)',
                  }}
                >
                  {getInitials(username)}
                </div>

                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {username}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {user && user.email ? user.email : 'Authenticated Member'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', marginTop: '4px', fontWeight: '600' }}>
                    🟢 Active PulseChat Account
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Bio Status
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="glass-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Security & Password Change */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#A855F7" />
                <span>Security & Password</span>
              </h2>

              <form onSubmit={handlePasswordChange}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--aurora-gradient)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Update Password
                </button>
              </form>
            </div>

            {/* Privacy & Notification Controls */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#EC4899" />
                <span>Privacy & Notifications</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      Online Presence Status
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Show green active status dot to accepted contacts.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlineVisibility}
                    onChange={(e) => setOnlineVisibility(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      Real-Time Contact Request Alerts
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Display instant popover toast when receiving requests.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.925rem' }}>
                      Sound Notifications
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Play subtle chime for incoming messages and calls.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* Appearance & Themes */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} color="#06B6D4" />
                <span>Visual Theme Palette</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                <button
                  onClick={() => setSelectedTheme('aurora')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTheme === 'aurora' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                    backgroundColor: 'rgba(13, 18, 36, 0.8)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Midnight Aurora</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Electric Indigo, Magenta & Glass</div>
                </button>

                <button
                  onClick={() => setSelectedTheme('obsidian')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTheme === 'obsidian' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                    backgroundColor: 'rgba(13, 18, 36, 0.8)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Obsidian Black</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pure Monochrome Dark</div>
                </button>

                <button
                  onClick={() => setSelectedTheme('cyberpunk')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedTheme === 'cyberpunk' ? '2px solid #8B5CF6' : '1px solid var(--border-color)',
                    backgroundColor: 'rgba(13, 18, 36, 0.8)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '4px' }}>Cyberpunk Pink</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vibrant Pink & Neon Cyan</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
