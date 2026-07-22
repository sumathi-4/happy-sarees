import React from 'react';
import styles from '../styles/Components.module.css';

function DashboardCard({ title, headerAction, children, className = '' }) {
  return (
    <div className={`${styles.dashboardCard} ${className}`}>
      {(title || headerAction) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {headerAction && <div className={styles.cardHeaderAction}>{headerAction}</div>}
        </div>
      )}
      <div className={styles.cardBody}>
        {children}
      </div>
    </div>
  );
}

export default DashboardCard;
