import React, { useRef, useEffect, useState } from 'react';
import { formatTimestamp, getInitials, getUserAvatarColor } from '../utils/formatters';
import { MessageSquare, RefreshCw, AlertTriangle } from 'lucide-react';

export const MessageList = ({
  messages = [],
  currentUsername,
  loading = false,
  error = null,
  onRetry,
}) => {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Handle scroll events to detect if user has manually scrolled up
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

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
            Start the conversation 👋 Send your first message below!
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
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {messages.map((msg, index) => {
        const isSelf = msg.username === currentUsername;
        const avatarColor = getUserAvatarColor(msg.username);

        // Check if previous message was from the same user to stack cleanly
        const prevMsg = messages[index - 1];
        const isSequence = prevMsg && prevMsg.username === msg.username;

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
                }}
              >
                {getInitials(msg.username)}
              </div>
            )}

            {!isSelf && isSequence && <div style={{ width: '32px', flexShrink: 0 }} />}

            <div
              style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSelf ? 'flex-end' : 'flex-start',
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
                  {msg.username}
                </span>
              )}

              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: isSelf
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  background: isSelf ? 'var(--bubble-self)' : 'var(--bubble-other)',
                  color: '#FFFFFF',
                  boxShadow: 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                  fontSize: '0.925rem',
                  lineHeight: '1.45',
                  border: isSelf ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {msg.content}
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  marginTop: '4px',
                  marginLeft: isSelf ? '0' : '4px',
                  marginRight: isSelf ? '4px' : '0',
                }}
              >
                {formatTimestamp(msg.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
