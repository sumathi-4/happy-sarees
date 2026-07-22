import React from 'react';
import { FiInbox } from 'react-icons/fi';
import styles from '../styles/Components.module.css';

function EmptyState({ title, description, icon = <FiInbox /> }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        {icon}
      </div>
      <h4 className={styles.emptyStateTitle}>{title}</h4>
      <p className={styles.emptyStateDesc}>{description}</p>
    </div>
  );
}

export default EmptyState;
