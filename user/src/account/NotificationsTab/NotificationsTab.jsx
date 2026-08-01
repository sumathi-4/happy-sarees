import React from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import styles from './NotificationsTab.module.css';

function NotificationsTab({ notifications = [], onMarkRead }) {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.tabTitle}>Notifications</h2>
          <span className={styles.subCount}>{notifications.length} Alerts ({unreadCount} unread)</span>
        </div>
        {unreadCount > 0 && onMarkRead && (
          <button
            onClick={onMarkRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--primary-color)',
              color: 'var(--primary-color)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <FiCheckCircle /> Mark All as Read
          </button>
        )}
      </div>

      <div className={styles.notifList}>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`${styles.notifCard} ${notif.unread ? styles.unreadCard : ''}`}>
              <div className={styles.iconBox}>
                <FiBell className={styles.bellIcon} />
              </div>

              <div className={styles.notifContent}>
                <div className={styles.titleRow}>
                  <h4 className={styles.notifTitle}>{notif.title}</h4>
                  <span className={styles.timeTag}>{notif.time}</span>
                </div>
                <p className={styles.notifMessage}>{notif.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666', background: 'var(--bg-white)', borderRadius: '12px' }}>
            <FiBell style={{ fontSize: '2.5rem', color: '#ccc', marginBottom: '0.8rem' }} />
            <h4 style={{ margin: '0 0 0.4rem', color: '#333' }}>No Notifications Yet</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>You'll receive updates here about your orders, returns, and reviews!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsTab;
