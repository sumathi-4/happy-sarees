import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Button from '../Button/Button';
import styles from './ConfirmationModal.module.css';

function ConfirmationModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <button onClick={onCancel} className={styles.closeBtn} aria-label="Close">
          <FiX />
        </button>

        <div className={styles.iconCircle}>
          <FiAlertTriangle />
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actionsRow}>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
