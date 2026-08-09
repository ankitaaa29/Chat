import React, { useState } from 'react';
import { ConnectionBadge } from './ConnectionBadge';
import { Hash, Users, LogOut, Menu, MoreVertical, ChevronDown, Check, Phone, Video, Shield, Info } from 'lucide-react';
import { getInitials, getUserAvatarColor } from '../utils/formatters';

const ROOM_OPTIONS = [
  { id: 'general', name: 'general', description: 'Main community discussion channel' },
  { id: 'random', name: 'random', description: 'Casual off-topic banter & fun' },
  { id: 'tech', name: 'tech', description: 'Software, code & technology chat' },
  { id: 'announcements', name: 'announcements', description: 'Platform news & release updates' },
];

export const ChatHeader = ({
  username,
  user,
  roomId = 'general',
  onRoomChange,
  connectionState,
  onlineCount = 0,
  onLogout,
  onToggleSidebar,
  onStartCall,
}) => {
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const avatarColor = getUserAvatarColor(username);

  const handleSelectRoom = (newRoomId) => {
    setShowRoomDropdown(false);
    if (onRoomChange && newRoomId !== roomId) {
      onRoomChange(newRoomId);
    }
  };

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
        position: 'relative',
        zIndex: 15,
      }}
    >
      {/* Left Header Group */}
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
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            transition: 'background 0.2s ease',
          }}
          className="mobile-menu-btn"
          title="Toggle online members"
        >
          <Menu size={22} />
        </button>

        {/* Room Switcher Control */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowRoomDropdown((prev) => !prev);
              setShowMoreMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-main)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hash size={16} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.975rem',
                  fontWeight: '700',
                  color: 'var(--text-main)',
                }}
              >
                #{roomId}
              </span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
          </button>

          {/* Room Switcher Dropdown Drawer */}
          {showRoomDropdown && (
            <div
              className="animate-fade-in glass-panel"
              style={{
                position: 'absolute',
                top: '48px',
                left: 0,
                width: '260px',
                borderRadius: 'var(--radius-md)',
                padding: '8px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 30,
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '6px 10px',
                }}
              >
                Switch Channel
              </div>

              {ROOM_OPTIONS.map((room) => {
                const isActive = room.id === roomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      color: isActive ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                      margin: '2px 0',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: isActive ? '700' : '500', fontSize: '0.875rem' }}>
                        <Hash size={14} />
                        <span>{room.name}</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {room.description}
                      </div>
                    </div>
                    {isActive && <Check size={16} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ConnectionBadge state={connectionState} />
      </div>

      {/* Right Header Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Voice Call Action Icon */}
        <button
          onClick={() => onStartCall && onStartCall('audio')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            e.currentTarget.style.color = '#10B981';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          title="Start Voice Call"
        >
          <Phone size={18} />
        </button>

        {/* Video Call Action Icon */}
        <button
          onClick={() => onStartCall && onStartCall('video')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            e.currentTarget.style.color = '#8B5CF6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          title="Start Video Call"
        >
          <Video size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 4px' }}>
          <Users size={13} color="var(--text-dim)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {onlineCount} online
          </span>
        </div>

        {/* User Profile & More Options Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowMoreMenu((prev) => !prev);
              setShowRoomDropdown(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 'var(--radius-md)',
              transition: 'background 0.2s ease',
            }}
            title="More options & profile"
          >
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
                fontWeight: '700',
                fontSize: '0.85rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {getInitials(username)}
            </div>

            <span
              style={{
                fontWeight: '600',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
              }}
            >
              {username}
            </span>

            <MoreVertical size={18} color="var(--text-muted)" />
          </button>

          {/* More Options Dropdown Drawer */}
          {showMoreMenu && (
            <div
              className="animate-fade-in glass-panel"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '260px',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 30,
              }}
            >
              {/* Profile Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingBottom: '12px',
                  marginBottom: '10px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: avatarColor,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                  }}
                >
                  {getInitials(username)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {username}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user && user.email ? user.email : 'Authenticated Member'}
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={14} color="var(--accent-green)" />
                  <span>Authenticated Session</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={14} color="var(--primary)" />
                  <span>Channel: #{roomId}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onLogout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  padding: '9px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
