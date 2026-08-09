import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🎉', '🚀', '💯', '👋'];

export const MessageInput = ({ onSendMessage, onInputChange, disabled = false }) => {
  const [content, setContent] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!content.trim() || disabled) return;

    onSendMessage(content.trim());
    setContent('');
    setShowEmojis(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    if (onInputChange) {
      onInputChange();
    }
  };

  const handleAddEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    if (onInputChange) onInputChange();
  };

  return (
    <div
      style={{
        padding: '14px 24px',
        backgroundColor: 'var(--bg-card-solid)',
        borderTop: '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {/* Quick Emoji Picker Popover */}
      {showEmojis && (
        <div
          className="animate-fade-in glass-panel"
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '24px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: '8px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20,
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleAddEmoji(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowEmojis((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: showEmojis ? 'var(--primary)' : 'var(--text-dim)',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease',
          }}
          title="Add emoji"
        >
          <Smile size={20} />
        </button>

        <input
          type="text"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Disconnected from chat server...' : 'Type a message...'}
          disabled={disabled}
          className="glass-input"
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.925rem',
          }}
        />

        <button
          type="submit"
          disabled={disabled || !content.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: disabled || !content.trim() ? 'rgba(99, 102, 241, 0.25)' : 'var(--primary-gradient)',
            color: '#FFFFFF',
            border: 'none',
            cursor: disabled || !content.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: disabled || !content.trim() ? 'none' : 'var(--shadow-glow)',
          }}
          onMouseEnter={(e) => {
            if (!disabled && content.trim()) {
              e.currentTarget.style.transform = 'scale(1.08)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && content.trim()) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
