import React, { useState } from 'react';
import { FiCheckSquare, FiSquare, FiMapPin, FiTruck, FiCreditCard, FiLock } from 'react-icons/fi';
import styles from './ReviewStep.module.css';

function ReviewStep({
  cartItems = [],
  selectedAddress,
  selectedDelivery,
  selectedPayment,
  grandTotal,
  onPlaceOrder,
  onPrevStep
}) {
  const [agreedTerms, setAgreedTerms] = useState(true);

  const handleOrderClick = () => {
    if (!agreedTerms) {
      alert('Please agree to the Terms & Conditions before placing your order.');
      return;
    }
    onPlaceOrder();
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.stepNum}>4</span>
          <h3 className={styles.stepTitle}>
            <FiCheckSquare className={styles.titleIcon} /> Order Review & Confirmation
          </h3>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className={styles.sectionBlock}>
        <h4 className={styles.sectionHeading}>Items in your bag ({cartItems.length})</h4>
        <div className={styles.itemsList}>
          {cartItems.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <img src={item.image} alt={item.name} className={styles.thumb} />
              <div className={styles.itemDetails}>
                <h5 className={styles.itemName}>{item.name}</h5>
                <span className={styles.itemMeta}>
                  {item.fabric} | Qty: <strong>{item.quantity}</strong>
                </span>
              </div>
              <span className={styles.itemPrice}>
                ₹{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Addresses & Methods Grid Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryBox}>
          <div className={styles.boxTitle}>
            <FiMapPin /> Delivery Address
          </div>
          {selectedAddress ? (
            <div className={styles.boxContent}>
              <strong>{selectedAddress.name}</strong> ({selectedAddress.label})
              <p>{selectedAddress.house}, {selectedAddress.street}, {selectedAddress.city} - {selectedAddress.pincode}</p>
              <span>Phone: {selectedAddress.phone}</span>
            </div>
          ) : (
            <p>No address selected</p>
          )}
        </div>

        <div className={styles.summaryBox}>
          <div className={styles.boxTitle}>
            <FiTruck /> Delivery Method
          </div>
          {selectedDelivery ? (
            <div className={styles.boxContent}>
              <strong>{selectedDelivery.name}</strong>
              <p>{selectedDelivery.estimate}</p>
              <span>{selectedDelivery.price === 0 ? 'FREE' : `+ ₹${selectedDelivery.price}`}</span>
            </div>
          ) : (
            <p>Standard Delivery</p>
          )}
        </div>

        <div className={styles.summaryBox}>
          <div className={styles.boxTitle}>
            <FiCreditCard /> Payment Method
          </div>
          {selectedPayment ? (
            <div className={styles.boxContent}>
              <strong>{selectedPayment.name}</strong>
              <p>{selectedPayment.desc}</p>
            </div>
          ) : (
            <p>UPI / Google Pay</p>
          )}
        </div>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className={styles.termsRow} onClick={() => setAgreedTerms(!agreedTerms)}>
        {agreedTerms ? (
          <FiCheckSquare className={styles.checkIcon} />
        ) : (
          <FiSquare className={styles.squareIcon} />
        )}
        <span className={styles.termsText}>
          I agree to Happy Sarees' <a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Conditions</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
        </span>
      </div>

      {/* Footer Place Order CTA */}
      <div className={styles.footerRow}>
        <button onClick={onPrevStep} className={styles.backBtn}>
          Back to Payment
        </button>
        <button onClick={handleOrderClick} className={styles.placeOrderBtn}>
          <FiLock /> Place Order (₹{grandTotal.toLocaleString()})
        </button>
      </div>
    </div>
  );
}

export default ReviewStep;
