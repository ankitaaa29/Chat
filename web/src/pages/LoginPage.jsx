import React, { useState } from 'react';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a username to join the chat');
      return;
    }

    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }

    if (trimmed.length > 25) {
      setError('Username cannot exceed 25 characters');
      return;
    }

    setError('');
    onLogin(trimmed);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-dark)',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
        padding: '20px',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            <MessageSquare size={28} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.65rem',
              fontWeight: '700',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}
          >
            PulseChat
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: '1.5',
            }}
          >
            Enter your display name to join real-time discussion rooms instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Display Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Ankita"
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--bg-input)',
                border: error ? '1px solid var(--accent-red)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {error && (
              <span
                style={{
                  display: 'block',
                  color: 'var(--accent-red)',
                  fontSize: '0.8rem',
                  marginTop: '6px',
                  fontWeight: '500',
                }}
              >
                {error}
              </span>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.35)';
            }}
          >
            <span>Enter Chat</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--text-dim)',
            fontSize: '0.78rem',
          }}
        >
          <Sparkles size={14} color="var(--primary)" />
          <span>Powered by Node.js, Express & Socket.io</span>
        </div>
      </div>
    </div>
  );
};
