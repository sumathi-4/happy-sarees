import React from 'react';
import { FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import styles from './WhyShopWithUs.module.css';

function WhyShopWithUs() {
  return (
    <div className={styles.barContainer}>
      <div className={styles.item}>
        <FiTruck className={styles.icon} />
        <div>
          <h5 className={styles.title}>Free Shipping</h5>
          <p className={styles.sub}>On orders above ₹999</p>
        </div>
      </div>

      <div className={styles.item}>
        <FiRefreshCw className={styles.icon} />
        <div>
          <h5 className={styles.title}>Easy Returns</h5>
          <p className={styles.sub}>Hassle-free 7 days return</p>
        </div>
      </div>

      <div className={styles.item}>
        <FiShield className={styles.icon} />
        <div>
          <h5 className={styles.title}>Secure Payments</h5>
          <p className={styles.sub}>100% Safe & Secure</p>
        </div>
      </div>
    </div>
  );
}

export default WhyShopWithUs;
