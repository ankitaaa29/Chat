import React, { useState } from 'react';
import { Users, Search, Sparkles } from 'lucide-react';
import { getInitials, getUserAvatarColor } from '../utils/formatters';

export const UserList = ({ onlineUsers = [], currentUsername, isOpen = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = onlineUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`sidebar ${isOpen ? 'mobile-open' : ''} glass-panel`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 10,
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '20px 20px 14px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={16} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                letterSpacing: '0.01em',
              }}
            >
              Active Members
            </h2>
          </div>
          <span
            style={{
              background: 'var(--primary-gradient)',
              color: '#FFFFFF',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '2px 9px',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {onlineUsers.length}
          </span>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '10px' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search online users..."
            className="glass-input"
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
            }}
          />
        </div>
      </div>

      {/* Online Users Roster */}
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
        {filteredUsers.length === 0 ? (
          <div
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
            }}
          >
            {searchQuery ? 'No users matching search' : 'No active users online'}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isSelf = user.username === currentUsername;
            const avatarColor = getUserAvatarColor(user.username);

            return (
              <div
                key={user.id || user.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelf ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  border: isSelf ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelf) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelf) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
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
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      boxShadow: 'var(--shadow-sm)',
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
                      border: '2px solid #121826',
                      boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
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
                          fontSize: '0.65rem',
                          color: '#FFFFFF',
                          background: 'var(--primary-gradient)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '700',
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                    }}
                  >
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-green)',
                        display: 'inline-block',
                      }}
                    />
                    Online
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
