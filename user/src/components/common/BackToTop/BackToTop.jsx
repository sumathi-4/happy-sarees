import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';
import styles from './BackToTop.module.css';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={styles.backToTopBtn}
      aria-label="Back to top"
      title="Back to Top"
    >
      <FiChevronUp />
    </button>
  );
}

export default BackToTop;
