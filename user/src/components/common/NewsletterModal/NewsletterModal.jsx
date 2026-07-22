import React from 'react';
import { FiGift, FiX } from 'react-icons/fi';
import Button from '../Button/Button';
import styles from './NewsletterModal.module.css';

function NewsletterModal({ isOpen, onClose, couponCode = 'HAPPYVIP15' }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
          <FiX />
        </button>

        <div className={styles.giftCircle}>
          <FiGift />
        </div>

        <h3 className={styles.title}>Welcome to Happy Sarees VIP Club! 🎉</h3>
        <p className={styles.desc}>
          Thank you for subscribing! Here is your exclusive welcome coupon for 15% OFF on your first silk saree purchase.
        </p>

        <div className={styles.couponBox}>
          <span className={styles.couponLabel}>YOUR EXCLUSIVE COUPON</span>
          <strong className={styles.couponCode}>{couponCode}</strong>
        </div>

        <Button variant="primary" fullWidth onClick={onClose}>
          Start Shopping Now
        </Button>
      </div>
    </div>
  );
}

export default NewsletterModal;
