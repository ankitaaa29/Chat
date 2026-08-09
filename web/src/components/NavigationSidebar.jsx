import React from 'react';
import { Home, MessageSquare, Users, UserPlus, Search, Settings, LogOut, Sparkles } from 'lucide-react';

export const NavigationSidebar = ({ activeTab, onTabChange, pendingRequestsCount = 0, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'contacts', label: 'Contacts', icon: Users },
    {
      id: 'requests',
      label: 'Requests',
      icon: UserPlus,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '260px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        borderRight: '1px solid var(--border-color)',
        zIndex: 10,
        backgroundColor: 'var(--bg-card-solid)',
      }}
    >
      <div>
        {/* Brand Logo Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '0 8px 24px 8px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--aurora-gradient)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-aurora)',
            }}
          >
            <Sparkles size={20} />
          </div>

          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: '800',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            PulseChat
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'var(--aurora-gradient)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.925rem',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? 'var(--shadow-aurora)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      backgroundColor: '#EC4899',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '11px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#EF4444',
          fontWeight: '600',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </aside>
  );
};
