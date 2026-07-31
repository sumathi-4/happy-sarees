import React from 'react';
import { FiLock, FiCreditCard, FiDollarSign, FiCheck, FiShield, FiAlertTriangle } from 'react-icons/fi';
import styles from './PaymentStep.module.css';

function PaymentStep({
  methods = [],
  selectedPaymentId,
  onSelectPayment,
  onNextStep,
  onPrevStep,
  grandTotal = 0,
  codMaxAmount = 5000,
  loading = false
}) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.stepNum}>3</span>
          <div>
            <h3 className={styles.stepTitle}>
              <FiLock className={styles.titleIcon} /> Payment Method
            </h3>
            <span className={styles.secureSub}>All transactions are 100% secure & encrypted</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <FiLock style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.4 }} />
          <p>Loading payment methods...</p>
        </div>
      ) : methods.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
          <FiLock style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.4 }} />
          <p>No payment methods available. Please contact store support.</p>
        </div>
      ) : (
        <div className={styles.methodsList}>
          {methods.map((method) => {
            const isSelected = selectedPaymentId === method.id;
            const isCod = method.id === 'pay_cod' || method.type === 'cod';
            const isOnline = method.id === 'pay_online' || method.type === 'online';

            const maxAllowedCod = Number(method.maxAmount || method.cod_max_amount || codMaxAmount || 5000);
            const isCodExceeded = isCod && grandTotal > maxAllowedCod;

            return (
              <div key={method.id} className={styles.methodWrapper}>
                <div
                  onClick={() => {
                    if (isCodExceeded) return;
                    onSelectPayment(method.id);
                  }}
                  className={`${styles.methodCard} ${isSelected && !isCodExceeded ? styles.selectedCard : ''} ${isCodExceeded ? styles.disabledCard : ''}`}
                >
                  <div className={styles.cardLeft}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={isSelected && !isCodExceeded}
                      disabled={isCodExceeded}
                      onChange={() => {
                        if (!isCodExceeded) onSelectPayment(method.id);
                      }}
                      className={styles.radio}
                    />

                    <div className={styles.iconBox}>
                      {isOnline ? (
                        <FiCreditCard className={styles.payIcon} />
                      ) : (
                        <FiDollarSign className={styles.payIcon} />
                      )}
                    </div>

                    <div className={styles.infoGroup}>
                      <h4 className={styles.methodName}>{method.name || method.title}</h4>
                      <p className={styles.methodDesc}>
                        {method.description || method.desc}
                      </p>
                    </div>
                  </div>

                  <div className={styles.cardRight}>
                    <div className={styles.badgeRow}>
                      {(method.icons || []).map((ic, i) => (
                        <span key={i} className={styles.iconPill}>{ic}</span>
                      ))}
                    </div>
                    {isSelected && !isCodExceeded && <FiCheck className={styles.checkIcon} />}
                  </div>
                </div>

                {/* Information Box when selected */}
                {isSelected && !isCodExceeded && isOnline && (
                  <div className={styles.detailsPanel}>
                    <div className={styles.infoNoticeBox}>
                      <FiShield style={{ fontSize: '1.2rem', color: '#d11b69', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1a1a1a' }}>Online Payment via Razorpay</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          You will complete your payment securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Net Banking, or Wallet.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onNextStep}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#d11b69',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <FiLock /> Proceed to Review & Pay (₹{grandTotal.toLocaleString()}) →
                    </button>
                  </div>
                )}

                {/* COD Exceeded Warning Notice */}
                {isCodExceeded && (
                  <div className={styles.warningNoticeBox}>
                    <FiAlertTriangle style={{ color: '#d32f2f', fontSize: '1.2rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#c62828', fontWeight: 600 }}>
                      Cash on Delivery is unavailable for orders above ₹{maxAllowedCod.toLocaleString()}. Please select <strong>Pay Online</strong>.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footerRow}>
        <button onClick={onPrevStep} className={styles.backBtn}>
          Back to Delivery
        </button>
        <button onClick={onNextStep} className={styles.nextBtn} disabled={methods.length === 0}>
          Continue to Order Review
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
