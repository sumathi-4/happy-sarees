import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';
import styles from './OrderSuccessModal.module.css';

function OrderSuccessModal({ orderId = 'HS-84920', totalAmount = 18796, address, onClose }) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onClose();
    navigate('/shop');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconCircle}>
          <FiCheckCircle className={styles.checkIcon} />
        </div>

        <h2 className={styles.title}>Order Placed Successfully! 🎉</h2>
        <p className={styles.subtitle}>
          Thank you for shopping with <strong>Happy Sarees</strong>. Your saree order has been confirmed and is being handpicked by our master weavers.
        </p>

        <div className={styles.infoBox}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Order Reference ID</span>
            <strong className={styles.orderId}>#{orderId}</strong>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Estimated Delivery</span>
            <strong className={styles.deliveryDate}>
              <FiPackage /> 22 July - 25 July
            </strong>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total Amount Paid</span>
            <strong className={styles.priceVal}>₹{totalAmount.toLocaleString()}</strong>
          </div>

          {address && (
            <div className={styles.addressSection}>
              <span className={styles.infoLabel}>Deliver To:</span>
              <p className={styles.addrText}>
                {address.name} ({address.label}) <br />
                {address.house}, {address.street}, {address.city} - {address.pincode}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button onClick={() => { onClose(); navigate('/profile?tab=orders'); }} className={styles.continueBtn} style={{ background: '#333', flex: 1 }}>
            <FiPackage /> View My Orders
          </button>
          <button onClick={handleContinue} className={styles.continueBtn} style={{ flex: 1 }}>
            <FiHome /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
