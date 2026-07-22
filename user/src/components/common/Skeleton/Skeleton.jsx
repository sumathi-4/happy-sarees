import React from 'react';
import styles from './Skeleton.module.css';

function Skeleton({ type = 'card', count = 1 }) {
  const renderItem = (index) => {
    if (type === 'card') {
      return (
        <div key={index} className={styles.productSkeletonCard}>
          <div className={`${styles.skeleton} ${styles.imgBox}`}></div>
          <div className={styles.metaBox}>
            <div className={`${styles.skeleton} ${styles.line}`} style={{ width: '80%' }}></div>
            <div className={`${styles.skeleton} ${styles.line}`} style={{ width: '50%' }}></div>
            <div className={`${styles.skeleton} ${styles.line}`} style={{ width: '40%', height: '24px' }}></div>
          </div>
        </div>
      );
    }

    if (type === 'list') {
      return (
        <div key={index} className={styles.listSkeletonRow}>
          <div className={`${styles.skeleton} ${styles.thumb}`}></div>
          <div className={styles.metaBox}>
            <div className={`${styles.skeleton} ${styles.line}`} style={{ width: '60%' }}></div>
            <div className={`${styles.skeleton} ${styles.line}`} style={{ width: '40%' }}></div>
          </div>
        </div>
      );
    }

    return <div key={index} className={`${styles.skeleton} ${styles.line}`}></div>;
  };

  return (
    <div className={styles.skeletonContainer}>
      {[...Array(count)].map((_, i) => renderItem(i))}
    </div>
  );
}

export default Skeleton;
