import React from 'react';

function NotificationItem({ message, time, isNew, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '12px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(43, 18, 32, 0.04)',
        cursor: 'pointer',
        alignItems: 'flex-start',
        backgroundColor: isNew ? 'rgba(209, 27, 105, 0.02)' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isNew ? 'var(--primary-color)' : '#cccccc',
          margin-top: '6px',
          flexShrink: 0
        }} 
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '12.5px', color: 'var(--text-color)', lineHeight: '1.4' }}>{message}</span>
        <span style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>{time}</span>
      </div>
    </div>
  );
}

export default NotificationItem;
