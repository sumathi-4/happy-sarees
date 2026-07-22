import React from 'react';
import styles from '../styles/Components.module.css';

function QuickActionCard({ label, icon, onClick }) {
  return (
    <div className={styles.quickActionCard} onClick={onClick}>
      <div className={styles.quickActionIcon}>
        {icon}
      </div>
      <span className={styles.quickActionLabel}>{label}</span>
    </div>
  );
}

export default QuickActionCard;
