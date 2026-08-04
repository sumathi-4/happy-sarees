import React, { useState } from 'react';
import { FiLock, FiCreditCard, FiDollarSign, FiCheck, FiShield, FiAlertTriangle, FiMaximize, FiCopy } from 'react-icons/fi';
import styles from './PaymentStep.module.css';

function PaymentStep({
  methods = [],
  selectedPaymentId,
  onSelectPayment,
  onNextStep,
  onPrevStep,
  grandTotal = 0,
  codMaxAmount = 5000,
  loading = false,
  utrNumber = '',
  setUtrNumber = () => {}
}) {
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleNextClick = () => {
    if (!selectedPaymentId || methods.length === 0) {
      alert('Please select a payment method to continue.');
      return;
    }
    const currentSelected = methods.find(m => m.id === selectedPaymentId);
    if (!currentSelected) {
      alert('Please select a valid payment method to continue.');
      return;
    }
    const isUpiQr = currentSelected.id === 'pay_upi_qr' || currentSelected.type === 'upi_qr';
    if (isUpiQr) {
      const cleanUtr = (utrNumber || '').trim();
      if (!cleanUtr) {
        alert('Please enter your 12-digit UPI Transaction Ref / UTR No. after paying to confirm your order.');
        return;
      }
      if (!/^\d{12}$/.test(cleanUtr)) {
        alert('Invalid UTR Number format. Please enter a valid 12-digit numeric UTR / Reference number from your UPI app (e.g. 329817263910).');
        return;
      }
    }
    onNextStep();
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

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
            const isUpiQr = method.id === 'pay_upi_qr' || method.type === 'upi_qr';

            const maxAllowedCod = Number(method.maxAmount || method.cod_max_amount || codMaxAmount || 5000);
            const isCodExceeded = isCod && grandTotal > maxAllowedCod;

            const payeeName = method.upiPayeeName || method.payeeName || 'Happy Sarees';
            const upiString = method.upiId
              ? `upi://pay?pa=${encodeURIComponent(method.upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR&am=${grandTotal}`
              : '';

            const qrDisplayUrl = upiString
              ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`
              : (method.qrCodeUrl || '');

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
                      ) : isUpiQr ? (
                        <FiMaximize className={styles.payIcon} />
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

                {/* Razorpay Online Payment Box */}
                {isSelected && !isCodExceeded && isOnline && (
                  <div className={styles.detailsPanel}>
                    <div className={styles.infoNoticeBox}>
                      <FiShield style={{ fontSize: '1.2rem', color: 'var(--primary-color)', flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#1a1a1a' }}>Online Payment via Razorpay</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          You will complete your payment securely via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, Net Banking, or Wallet.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNextClick}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'var(--bg-white)',
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

                {/* UPI QR Scanner Payment Box */}
                {isSelected && !isCodExceeded && isUpiQr && (
                  <div className={styles.detailsPanel} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#27189d', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                        SCAN QR CODE & PAY VIA GOOGLE PAY / PHONEPE / PAYTM / BHIM
                      </span>
                      {qrDisplayUrl ? (
                        <div style={{ margin: '12px auto', width: '200px', height: '200px', background: '#ffffff', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                          <img
                            src={qrDisplayUrl}
                            alt="UPI QR Scanner"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div style={{ margin: '12px auto', maxWidth: '360px', padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                          <FiMaximize style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '6px' }} />
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, fontWeight: 500 }}>
                            Please enter UPI ID in Admin Settings → Integrations to automatically generate payment QR code.
                          </p>
                        </div>
                      )}

                      {/* Pre-filled Amount Badge */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginTop: '8px',
                        marginBottom: '8px'
                      }}>
                        ✓ Amount Pre-filled: ₹{grandTotal.toLocaleString('en-IN')}
                      </div>

                      {method.upiId ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{method.upiId}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(method.upiId)}
                              style={{ background: '#27189d', color: '#fff', border: 'none', borderRadius: '14px', padding: '3px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FiCopy style={{ fontSize: '11px' }} />
                              {copiedUpi ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                        Payment Transaction Ref / UTR No. <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 12-digit UTR No. (e.g. 329817263910)"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                        Please enter the 12-digit UTR / Reference number from GPay/PhonePe after paying.
                      </span>
                    </div>

                    <button
                      onClick={handleNextClick}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#27189d',
                        color: 'var(--bg-white)',
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
                      <FiLock /> Continue to Order Review (₹{grandTotal.toLocaleString()}) →
                    </button>
                  </div>
                )}

                {/* COD Exceeded Warning Notice */}
                {isCodExceeded && (
                  <div className={styles.warningNoticeBox}>
                    <FiAlertTriangle style={{ color: 'var(--error-color)', fontSize: '1.2rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--error-color)', fontWeight: 600 }}>
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
        <button onClick={handleNextClick} className={styles.nextBtn} disabled={methods.length === 0}>
          Continue to Order Review
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
