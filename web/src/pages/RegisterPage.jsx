import React, { useState } from 'react';
import { MessageSquare, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { registerApi } from '../services/api';

export const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUser = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUser || !trimmedEmail || !password) {
      setError('All fields are required');
      return;
    }

    if (trimmedUser.length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await registerApi({
        username: trimmedUser,
        email: trimmedEmail,
        password,
      });

      if (response && response.data) {
        onRegisterSuccess(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-dark)',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px',
          boxShadow: 'var(--shadow-lg)',
          margin: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '28px',
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
            Create Your Account
          </h1>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Join PulseChat for end-to-end encrypted real-time messaging.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#EF4444',
              fontSize: '0.85rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Ankita"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ankita@example.com"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.925rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '0',
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
