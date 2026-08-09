import React from 'react';

export const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        fontStyle: 'italic',
      }}
      className="animate-fade-in"
    >
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'inline-block',
          }}
          className="bounce-1"
        />
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'inline-block',
          }}
          className="bounce-2"
        />
        <span
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            display: 'inline-block',
          }}
          className="bounce-3"
        />
      </div>
      <span>{text}</span>
    </div>
  );
};
