import React, { useState, useEffect } from 'react';
import { ANNOUNCEMENT_MESSAGES } from '../../data/mockData';
import styles from './AnnouncementBar.module.css';

function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
        setFade(true);
      }, 500); // fade out duration
    }, 4000); // transition every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.bar}>
      <p className={`${styles.message} ${fade ? styles.fadeIn : styles.fadeOut}`}>
        {ANNOUNCEMENT_MESSAGES[index]}
      </p>
    </div>
  );
}

export default AnnouncementBar;
