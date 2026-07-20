import React from 'react';
import styles from './SectionTitle.module.css';

function SectionTitle({ tag, title, description, centered = true }) {
  return (
    <div className={`${styles.wrapper} ${centered ? styles.centered : styles.leftAligned}`}>
      {tag && <span className={styles.tag}>{tag}</span>}
      {title && <h2 className={styles.title}>{title}</h2>}
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

export default SectionTitle;
