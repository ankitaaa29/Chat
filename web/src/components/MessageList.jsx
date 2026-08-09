import React, { useRef, useEffect, useState } from 'react';
import { formatTimestamp, getInitials, getUserAvatarColor } from '../utils/formatters';
import { MessageSquare, RefreshCw, AlertTriangle, Heart } from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const MessageList = ({
  messages = [],
  currentUsername,
  currentUserId,
  loading = false,
  error = null,
  onRetry,
}) => {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);
  const [likedMessages, setLikedMessages] = useState(new Set());

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  const toggleLike = (msgId) => {
    setLikedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          gap: '12px',
        }}
      >
        <RefreshCw size={28} className="spin" color="var(--primary)" />
        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Loading message history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          gap: '14px',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--accent-red)',
          }}
        >
          <AlertTriangle size={32} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>
            Connection Error
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
          }}
        >
          <MessageSquare size={32} />
        </div>
        <div>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: '600', marginBottom: '4px' }}>
            No messages yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Start the conversation 👋 Send a message or photo below!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Lightbox Modal */}
      <ImageLightboxModal
        imageUrl={selectedLightboxImage}
        onClose={() => setSelectedLightboxImage(null)}
      />

      {messages.map((msg, index) => {
        const senderUsername = msg.sender?.username || msg.username || 'User';
        const senderId = msg.senderId || msg.sender?.id;

        const isSelf =
          (currentUserId && senderId === currentUserId) ||
          (currentUsername && senderUsername.toLowerCase() === currentUsername.toLowerCase());

        const avatarColor = getUserAvatarColor(senderUsername);
        const isLiked = likedMessages.has(msg.id);

        const prevMsg = messages[index - 1];
        const prevSender = prevMsg ? prevMsg.sender?.username || prevMsg.username : null;
        const isSequence = prevSender === senderUsername;

        const mediaFullUrl = msg.mediaUrl
          ? msg.mediaUrl.startsWith('http')
            ? msg.mediaUrl
            : `${API_URL}${msg.mediaUrl}`
          : null;

        return (
          <div
            key={msg.id || index}
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: isSelf ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: isSequence ? '-8px' : '0',
              position: 'relative',
            }}
          >
            {!isSelf && !isSequence && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: avatarColor,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  flexShrink: 0,
                  marginTop: '2px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {getInitials(senderUsername)}
              </div>
            )}

            {!isSelf && isSequence && <div style={{ width: '32px', flexShrink: 0 }} />}

            <div
              style={{
                maxWidth: '72%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSelf ? 'flex-end' : 'flex-start',
                position: 'relative',
              }}
            >
              {!isSelf && !isSequence && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                    marginLeft: '4px',
                  }}
                >
                  {senderUsername}
                </span>
              )}

              {/* Message Content Bubble with double-tap heart */}
              <div
                onDoubleClick={() => toggleLike(msg.id)}
                style={{
                  padding: mediaFullUrl ? '6px' : '10px 16px',
                  borderRadius: isSelf
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  background: isSelf ? 'var(--bubble-self)' : 'var(--bubble-other)',
                  color: '#FFFFFF',
                  boxShadow: isSelf ? 'var(--shadow-aurora)' : 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                  fontSize: '0.925rem',
                  lineHeight: '1.45',
                  border: isSelf ? 'none' : '1px solid var(--border-color)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {/* Photo Media Attachment */}
                {mediaFullUrl && (
                  <div style={{ marginBottom: msg.content ? '8px' : '0' }}>
                    <img
                      src={mediaFullUrl}
                      alt="Chat attachment"
                      onClick={() => setSelectedLightboxImage(mediaFullUrl)}
                      style={{
                        width: '100%',
                        maxHeight: '320px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        display: 'block',
                        cursor: 'zoom-in',
                      }}
                    />
                  </div>
                )}

                {msg.content ? <div>{msg.content}</div> : null}

                {/* Heart Reaction Badge */}
                {isLiked && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: isSelf ? 'auto' : '-8px',
                      left: isSelf ? '-8px' : 'auto',
                      backgroundColor: 'rgba(236, 72, 153, 0.95)',
                      padding: '3px 6px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(236, 72, 153, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Heart size={12} color="#FFFFFF" fill="#FFFFFF" />
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)',
                    marginLeft: isSelf ? '0' : '4px',
                    marginRight: isSelf ? '4px' : '0',
                  }}
                >
                  {formatTimestamp(msg.createdAt)}
                </span>
                <button
                  onClick={() => toggleLike(msg.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isLiked ? '#EC4899' : 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Like message"
                >
                  <Heart size={12} fill={isLiked ? '#EC4899' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
