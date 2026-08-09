import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionBadge = ({ state }) => {
  let badgeStyle = {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10B981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  };
  let label = 'Live';
  let Icon = Wifi;

  if (state === 'reconnecting') {
    badgeStyle = {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#F59E0B',
      border: '1px solid rgba(245, 158, 11, 0.3)',
    };
    label = 'Reconnecting...';
    Icon = RefreshCw;
  } else if (state === 'offline') {
    badgeStyle = {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#EF4444',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    };
    label = 'Offline';
    Icon = WifiOff;
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        letterSpacing: '0.02em',
        ...badgeStyle,
      }}
    >
      <Icon size={12} className={state === 'reconnecting' ? 'spin' : ''} />
      <span>{label}</span>
    </div>
  );
};
