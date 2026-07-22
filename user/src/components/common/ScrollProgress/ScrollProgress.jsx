import React, { useState, useEffect } from 'react';
import styles from './ScrollProgress.module.css';

function ScrollProgress() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      if (documentHeight > 0) {
        const scrolled = (window.scrollY / documentHeight) * 100;
        setScrollPercentage(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.barContainer}>
      <div
        className={styles.barFill}
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
}

export default ScrollProgress;
