import React from 'react';
import { FiPlay } from 'react-icons/fi';
import styles from './WatchAndBuySection.module.css';

function WatchAndBuySection({ videos = [] }) {
  if (!videos.length) return null;

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Watch & Buy</h3>
        <button className={styles.viewAllBtn}>View All</button>
      </div>

      <div className={styles.videoGrid}>
        {videos.map((vid) => (
          <div key={vid.id} className={styles.videoCard}>
            <div className={styles.thumbnailWrapper}>
              <img src={vid.thumbnail} alt={vid.title} className={styles.thumbnailImg} />
              
              {/* Play Button Overlay */}
              <div className={styles.playOverlay}>
                <div className={styles.playCircle}>
                  <FiPlay className={styles.playIcon} />
                </div>
              </div>

              {/* Video Duration Badge */}
              <span className={styles.durationBadge}>{vid.duration}</span>
            </div>

            <h4 className={styles.videoTitle}>{vid.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WatchAndBuySection;
