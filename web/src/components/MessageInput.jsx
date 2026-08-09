import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const MessageInput = ({ onSendMessage, onInputChange, disabled = false }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSendMessage(content.trim());
    setContent('');
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 24px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <input
        type="text"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Disconnected from chat server...' : 'Type a message...'}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px 18px',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-main)',
          fontSize: '0.925rem',
          outline: 'none',
          transition: 'all 0.2s ease',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
      />

      <button
        type="submit"
        disabled={disabled || !content.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: disabled || !content.trim() ? 'rgba(99, 102, 241, 0.3)' : 'var(--primary)',
          color: '#FFFFFF',
          border: 'none',
          cursor: disabled || !content.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: disabled || !content.trim() ? 'none' : 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          if (!disabled && content.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && content.trim()) {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
