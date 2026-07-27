import React from 'react';
import { FiTruck, FiClock, FiShoppingBag, FiCheck } from 'react-icons/fi';
import styles from './DeliveryStep.module.css';

// Dynamically pick icon by method name/description (no hardcoded IDs)
function getMethodIcon(method) {
  const name = (method.name || '').toLowerCase();
  const desc = (method.description || '').toLowerCase();
  if (name.includes('express') || name.includes('premium') || name.includes('fast') || name.includes('urgent')) {
    return <FiClock className={styles.optIcon} />;
  }
  if (name.includes('pickup') || name.includes('collect') || name.includes('boutique') || name.includes('store') || desc.includes('pickup')) {
    return <FiShoppingBag className={styles.optIcon} />;
  }
  return <FiTruck className={styles.optIcon} />;
}

function DeliveryStep({
  options = [],
  selectedOptionId,
  onSelectOption,
  onNextStep,
  onPrevStep,
  cartSubtotal = 0,
  freeShippingEnabled = false,
  freeShippingMinAmount = 2999,
  loading = false
}) {
  // Dynamic free shipping eligibility check
  const qualifiesForFreeShipping = freeShippingEnabled && cartSubtotal >= freeShippingMinAmount;

  // Compute effective price for a given method considering free shipping rules
  const getEffectivePrice = (opt) => {
    if (qualifiesForFreeShipping && opt.free_shipping_eligible) return 0;
    return Number(opt.shipping_charge || opt.price || 0);
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.stepNum}>2</span>
          <h3 className={styles.stepTitle}>
            <FiTruck className={styles.titleIcon} /> Delivery Options
          </h3>
        </div>
      </div>

      {qualifiesForFreeShipping && (
        <div style={{ margin: '0 0 14px', padding: '10px 16px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '10px', fontSize: '13px', color: '#2e7d32', fontWeight: 600 }}>
          🎉 Your cart qualifies for <strong>Free Shipping</strong> (min. ₹{freeShippingMinAmount.toLocaleString()})! Eligible methods are now FREE.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <FiTruck style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.4 }} />
          <p>Loading delivery options...</p>
        </div>
      ) : options.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
          <FiTruck style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.4 }} />
          <p>No delivery options available. Please contact the store.</p>
        </div>
      ) : (
        <div className={styles.optionsList}>
          {options.map((opt) => {
            const effectivePrice = getEffectivePrice(opt);
            const isSelected = selectedOptionId === opt.id;
            const isFreeByRule = qualifiesForFreeShipping && opt.free_shipping_eligible && Number(opt.shipping_charge || opt.price || 0) > 0;

            return (
              <div
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`${styles.optionCard} ${isSelected ? styles.selectedCard : ''}`}
              >
                <div className={styles.cardLeft}>
                  <input
                    type="radio"
                    name="delivery_method"
                    checked={isSelected}
                    onChange={() => onSelectOption(opt.id)}
                    className={styles.radio}
                  />

                  <div className={styles.iconBox}>
                    {getMethodIcon(opt)}
                  </div>

                  <div className={styles.infoGroup}>
                    <h4 className={styles.optName}>{opt.name}</h4>
                    <p className={styles.optEstimate}>
                      {opt.description || opt.estimate || opt.estimated_delivery_days}
                    </p>
                    {isFreeByRule && (
                      <span style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 700 }}>
                        ✓ Free Shipping Applied
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.cardRight}>
                  {effectivePrice === 0 ? (
                    <span className={styles.freeBadge}>FREE</span>
                  ) : (
                    <span className={styles.priceVal}>+ ₹{effectivePrice}</span>
                  )}
                  {isSelected && <FiCheck className={styles.checkIcon} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footerRow}>
        <button onClick={onPrevStep} className={styles.backBtn}>
          Back to Address
        </button>
        <button onClick={onNextStep} className={styles.nextBtn} disabled={options.length === 0}>
          Continue to Payment Method
        </button>
      </div>
    </div>
  );
}

export default DeliveryStep;
