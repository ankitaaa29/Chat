import React from 'react';
import { ConnectionBadge } from './ConnectionBadge';
import { Hash, Users, LogOut, Menu } from 'lucide-react';
import { getInitials, getUserAvatarColor } from '../utils/formatters';

export const ChatHeader = ({
  username,
  roomId = 'general',
  connectionState,
  onlineCount = 0,
  onLogout,
  onToggleSidebar,
}) => {
  const avatarColor = getUserAvatarColor(username);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        minHeight: '64px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px',
          }}
          className="mobile-menu-btn"
          title="Toggle online users"
        >
          <Menu size={22} />
        </button>

        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Hash size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                letterSpacing: '-0.01em',
              }}
            >
              {roomId}
            </h1>
            <ConnectionBadge state={connectionState} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Users size={13} color="var(--text-dim)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {onlineCount} {onlineCount === 1 ? 'member' : 'members'} online
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: avatarColor,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              fontSize: '0.85rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {getInitials(username)}
          </div>
          <span
            style={{
              fontWeight: '500',
              fontSize: '0.9rem',
              color: 'var(--text-main)',
            }}
          >
            {username}
          </span>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#EF4444';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
          title="Sign out"
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
};
