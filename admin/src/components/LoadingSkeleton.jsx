import React from 'react';
import styles from '../styles/Components.module.css';

function LoadingSkeleton({ type }) {
  if (type === 'card') {
    return (
      <div className={styles.statCard}>
        <div className={styles.statCardHeader}>
          <div className={styles.skeleton} style={{ width: '80px', height: '14px' }} />
          <div className={styles.skeleton} style={{ width: '38px', height: '38px', borderRadius: '8px' }} />
        </div>
        <div className={styles.skeleton} style={{ width: '120px', height: '28px', marginTop: '12px' }} />
        <div className={styles.skeleton} style={{ width: '100px', height: '12px', marginTop: '8px' }} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px' }}>
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} style={{ display: 'flex', gap: '20px' }}>
            <div className={styles.skeleton} style={{ flex: 1, height: '20px' }} />
            <div className={styles.skeleton} style={{ flex: 2, height: '20px' }} />
            <div className={styles.skeleton} style={{ flex: 1, height: '20px' }} />
            <div className={styles.skeleton} style={{ flex: 1, height: '20px' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.skeleton} style={{ width: '100%', height: '100px' }} />
  );
}

export default LoadingSkeleton;
