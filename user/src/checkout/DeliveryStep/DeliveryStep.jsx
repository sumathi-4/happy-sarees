import React from 'react';
import { FiTruck, FiClock, FiShoppingBag, FiCheck } from 'react-icons/fi';
import styles from './DeliveryStep.module.css';

function DeliveryStep({ options = [], selectedOptionId, onSelectOption, onNextStep, onPrevStep }) {
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

      <div className={styles.optionsList}>
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;

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
                  {opt.id.includes('express') ? (
                    <FiClock className={styles.optIcon} />
                  ) : opt.id.includes('pickup') ? (
                    <FiShoppingBag className={styles.optIcon} />
                  ) : (
                    <FiTruck className={styles.optIcon} />
                  )}
                </div>

                <div className={styles.infoGroup}>
                  <h4 className={styles.optName}>{opt.name}</h4>
                  <p className={styles.optEstimate}>{opt.estimate}</p>
                </div>
              </div>

              <div className={styles.cardRight}>
                {opt.price === 0 ? (
                  <span className={styles.freeBadge}>FREE</span>
                ) : (
                  <span className={styles.priceVal}>+ ₹{opt.price}</span>
                )}
                {isSelected && <FiCheck className={styles.checkIcon} />}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footerRow}>
        <button onClick={onPrevStep} className={styles.backBtn}>
          Back to Address
        </button>
        <button onClick={onNextStep} className={styles.nextBtn}>
          Continue to Payment Method
        </button>
      </div>
    </div>
  );
}

export default DeliveryStep;
