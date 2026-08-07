import React, { useEffect, useState } from 'react';
import { sellerApi } from '../api/sellerApi';
import { FiBell, FiCheckSquare, FiMail, FiMessageSquare } from 'react-icons/fi';
import styles from '../styles/Orders.module.css'; // Reuses card and empty classes

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications() {
    try {
      const res = await sellerApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await sellerApi.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await sellerApi.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading notification inbox...</div>;
  if (error) return <div style={{ padding: '20px', color: 'var(--error-color)' }}>{error}</div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={styles.container}>
      <div className={styles.detailCard} style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--text-color)' }}>Notifications Inbox</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'none', border: '1.5px solid var(--border-color)',
                padding: '8px 16px', borderRadius: 'var(--radius-button)',
                fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)',
                cursor: 'pointer', transition: 'var(--transition-smooth)'
              }}
            >
              <FiCheckSquare /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBell style={{ fontSize: '48px', color: 'var(--accent-blush)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-color)' }}>Your Inbox is Empty</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
              We'll notify you about registration reviews, product approvals, payouts, and customer orders.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div 
                key={n.id} 
                style={{
                  display: 'flex', gap: '16px', padding: '16px 20px',
                  borderRadius: 'var(--radius-premium)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: n.isRead ? 'var(--bg-white)' : 'rgba(209, 27, 105, 0.03)',
                  borderLeft: n.isRead ? '1px solid var(--border-color)' : '4px solid var(--primary-color)',
                  transition: 'var(--transition-fast)',
                  cursor: n.isRead ? 'default' : 'pointer'
                }}
                onClick={() => { if (!n.isRead) handleMarkRead(n.id); }}
              >
                <div style={{ fontSize: '20px', color: n.isRead ? 'var(--text-light)' : 'var(--primary-color)', marginTop: '2px' }}>
                  {n.type === 'registration_status' ? <FiCheckSquare /> : 
                   n.type === 'product_status' ? <FiMessageSquare /> : <FiMail />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>{n.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>{n.message}</p>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '8px', display: 'block' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--primary-color)',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
