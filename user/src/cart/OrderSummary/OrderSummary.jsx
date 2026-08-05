import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiGift, FiTag } from 'react-icons/fi';
import styles from './OrderSummary.module.css';

function OrderSummary({ items = [], appliedCoupon = null, onApplyCoupon }) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [addGiftWrap, setAddGiftWrap] = useState(false);

  // Calculations
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const sellingTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = subtotal - sellingTotal;

  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount += Math.round((sellingTotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discount += appliedCoupon.discountAmount;
    }
  }

  const giftWrapFee = addGiftWrap ? 99 : 0;
  const finalTotal = Math.max(0, subtotal - discount + giftWrapFee);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  return (
    <div className={styles.summaryCard}>
      <h3 className={styles.title}>Order Summary</h3>

      {/* Breakdown Rows */}
      <div className={styles.breakdownTable}>
        <div className={styles.row}>
          <span className={styles.label}>Subtotal ({totalQuantity} items)</span>
          <span className={styles.val}>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Discount</span>
          <span className={`${styles.val} ${styles.discountVal}`}>- ₹{discount.toLocaleString()}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Shipping</span>
          <span className={`${styles.val} ${styles.freeVal}`}>FREE</span>
        </div>

        {/* Gift Wrap Checkbox */}
        <label className={styles.giftWrapRow}>
          <input
            type="checkbox"
            checked={addGiftWrap}
            onChange={(e) => setAddGiftWrap(e.target.checked)}
            className={styles.checkbox}
          />
          <FiGift className={styles.giftIcon} />
          <span className={styles.giftText}>Add Luxury Gift Wrap (₹99)</span>
        </label>

        <div className={styles.divider}></div>

        {/* Total Amount */}
        <div className={`${styles.row} ${styles.totalRow}`}>
          <span className={styles.totalLabel}>Total Amount</span>
          <span className={styles.totalVal}>₹{finalTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Savings Notification Bubble */}
      {discount > 0 && (
        <div className={styles.savingsNotice}>
          🎁 You are saving <strong>₹{discount.toLocaleString()}</strong> today!
        </div>
      )}

      {/* Proceed to Checkout CTA */}
      <button
        onClick={() => navigate('/checkout', { state: { appliedCoupon } })}
        className={styles.checkoutBtn}
      >
        Proceed to Checkout <FiChevronRight />
      </button>

      {/* Coupon Form */}
      <div className={styles.couponSection}>
        <form onSubmit={handleCouponSubmit} className={styles.couponForm}>
          <div className={styles.couponInputWrapper}>
            <FiTag className={styles.couponIcon} />
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className={styles.couponInput}
            />
          </div>
          <button type="submit" className={styles.applyBtn}>Apply</button>
        </form>
      </div>

      {/* Payment Badges Footer */}
      <div className={styles.paymentFooter}>
        <span className={styles.paymentLabel}>Guaranteed Safe Checkout</span>
        <div className={styles.paymentBadges}>
          <span className={styles.payBadge}>RAZORPAY</span>
          <span className={styles.payBadge}>COD</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
