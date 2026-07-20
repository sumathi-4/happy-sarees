import React from 'react';
import { FiBell } from 'react-icons/fi';
import styles from './NotificationsTab.module.css';

function NotificationsTab({ notifications = [] }) {
  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.tabTitle}>Notifications</h2>
          <span className={styles.subCount}>{notifications.length} Alerts</span>
        </div>
      </div>

      <div className={styles.notifList}>
        {notifications.map((notif) => (
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
        ))}
      </div>
    </div>
  );
}

export default NotificationsTab;
