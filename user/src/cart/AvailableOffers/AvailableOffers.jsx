import React from 'react';
import { FiCheckCircle, FiTag } from 'react-icons/fi';
import styles from './AvailableOffers.module.css';

function AvailableOffers({ offers = [], appliedCoupon, onApplyCoupon }) {
  if (!offers.length) return null;

  return (
    <div className={styles.cardContainer}>
      <h4 className={styles.cardTitle}>Available Offers</h4>
      <div className={styles.offersList}>
        {offers.map((offer) => {
          const isCurrentApplied = appliedCoupon?.code === offer.code || (offer.isApplied && !appliedCoupon);

          return (
            <div key={offer.id} className={`${styles.offerCard} ${isCurrentApplied ? styles.appliedCard : ''}`}>
              <div className={styles.offerLeft}>
                <div className={styles.codeRow}>
                  <FiTag className={styles.tagIcon} />
                  <span className={styles.codeText}>{offer.code}</span>
                  {offer.badge && <span className={styles.badge}>{offer.badge}</span>}
                </div>
                <p className={styles.offerDesc}>{offer.title}</p>
              </div>

              <button
                onClick={() => onApplyCoupon(offer.code)}
                disabled={isCurrentApplied}
                className={`${styles.applyBtn} ${isCurrentApplied ? styles.appliedBtn : ''}`}
              >
                {isCurrentApplied ? (
                  <>
                    <FiCheckCircle /> Applied
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AvailableOffers;
