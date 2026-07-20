import React from 'react';
import styles from './LoadingScreen.module.css';

function LoadingScreen({ message = 'Loading Happy Sarees Curations...' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.lotusSpinner}>
          <div className={styles.ring}></div>
          <span className={styles.emoji}>🌸</span>
        </div>
        <h3 className={styles.brandTitle}>HAPPY SAREES</h3>
        <p className={styles.msg}>{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
