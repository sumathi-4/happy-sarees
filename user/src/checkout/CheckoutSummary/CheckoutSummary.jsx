import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import styles from './CheckoutSummary.module.css';

function CheckoutSummary({ cartItems = [], deliveryPrice = 0, discountAmount = 0 }) {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.max(0, (subtotal - sellingTotal) + Number(discountAmount || 0));
  const grandTotal = Math.max(0, subtotal - discount + Number(deliveryPrice || 0));

  return (
    <div className={styles.stickyColumn}>
      <div className={styles.summaryCard}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>Order Summary</h3>
          <div className={styles.rightHeader}>
            <span className={styles.itemCount}>{totalQuantity} Items</span>
            <Link to="/cart" className={styles.editCartLink}>Edit Cart</Link>
          </div>
        </div>

        {/* Mini Product List */}
        <div className={styles.miniList}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.miniItem}>
              <img src={item.image} alt={item.name} className={styles.miniImg} />
              <div className={styles.miniMeta}>
                <h5 className={styles.miniName}>{item.name}</h5>
                <span className={styles.miniQty}>Qty: {item.quantity}</span>
              </div>
              <span className={styles.miniPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className={styles.divider}></div>

        {/* Price Breakdown */}
        <div className={styles.breakdownTable}>
          <div className={styles.row}>
            <span className={styles.label}>Subtotal</span>
            <span className={styles.val}>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Discount (-)</span>
            <span className={`${styles.val} ${styles.discountVal}`}>- ₹{discount.toLocaleString()}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Shipping</span>
            <span className={`${styles.val} ${styles.freeVal}`}>
              {deliveryPrice === 0 ? 'FREE' : `+ ₹${deliveryPrice}`}
            </span>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Grand Total */}
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total Amount</span>
          <span className={styles.totalVal}>₹{grandTotal.toLocaleString()}</span>
        </div>

        {/* Savings Pill */}
        {discount > 0 && (
          <div className={styles.savingsNotice}>
            🎁 Yay! You are saving <strong>₹{discount.toLocaleString()}</strong> on this order
          </div>
        )}
      </div>

      {/* Shop with Confidence Box */}
      <div className={styles.confidenceCard}>
        <h4 className={styles.confidenceTitle}>Shop with Confidence</h4>
        <div className={styles.confidenceGrid}>
          <div className={styles.confidenceItem}>
            <FiCheckCircle className={styles.confIcon} />
            <div>
              <h6>100% Quality Assured</h6>
              <p>Premium quality products</p>
            </div>
          </div>
          <div className={styles.confidenceItem}>
            <FiRefreshCw className={styles.confIcon} />
            <div>
              <h6>Easy 7 Days Returns</h6>
              <p>Hassle free returns</p>
            </div>
          </div>
          <div className={styles.confidenceItem}>
            <FiShield className={styles.confIcon} />
            <div>
              <h6>Secure Payments</h6>
              <p>Your payments are 100% safe</p>
            </div>
          </div>
          <div className={styles.confidenceItem}>
            <FiTruck className={styles.confIcon} />
            <div>
              <h6>Free Shipping</h6>
              <p>On orders above ₹999</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSummary;
