import React from 'react';
import styles from './Badge.module.css';

function Badge({ children, variant = 'pink', className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
