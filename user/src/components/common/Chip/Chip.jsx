import React from 'react';
import styles from './Chip.module.css';

function Chip({ label, active = false, onClick, icon = null, onRemove = null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.chip} ${active ? styles.active : ''}`}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={styles.removeBtn}
        >
          ×
        </span>
      )}
    </button>
  );
}

export default Chip;
