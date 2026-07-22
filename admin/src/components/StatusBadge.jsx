import React from 'react';
import styles from '../styles/Components.module.css';

function StatusBadge({ status }) {
  const getBadgeClass = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.badgePending;
      case 'processing':
        return styles.badgeProcessing;
      case 'shipped':
        return styles.badgeShipped;
      case 'delivered':
        return styles.badgeDelivered;
      case 'cancelled':
        return styles.badgeCancelled;
      default:
        return '';
    }
  };

  return (
    <span className={`${styles.badge} ${getBadgeClass()}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
