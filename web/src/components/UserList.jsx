import React from 'react';
import { Users, Circle, ShieldCheck } from 'lucide-react';
import { getInitials, getUserAvatarColor } from '../utils/formatters';

export const UserList = ({ onlineUsers = [], currentUsername, isOpen = false }) => {
  return (
    <aside
      className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 10,
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={18} color="var(--primary)" />
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.95rem',
              fontWeight: '700',
              color: 'var(--text-main)',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            Online Users
          </h2>
        </div>
        <span
          style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {onlineUsers.length}
        </span>
      </div>

      {/* Online Users List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {onlineUsers.length === 0 ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
            }}
          >
            No active users online
          </div>
        ) : (
          onlineUsers.map((user) => {
            const isSelf = user.username === currentUsername;
            const avatarColor = getUserAvatarColor(user.username);

            return (
              <div
                key={user.id || user.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelf ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'background 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  if (!isSelf) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelf) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: avatarColor,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  >
                    {getInitials(user.username)}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-green)',
                      border: '2px solid var(--bg-card)',
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: isSelf ? '700' : '500',
                        color: 'var(--text-main)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user.username}
                    </span>
                    {isSelf && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--primary)',
                          backgroundColor: 'var(--primary-light)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: '600',
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ● Active now
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
