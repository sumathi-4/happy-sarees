import React, { useState } from 'react';
import { FiLock, FiCreditCard, FiSmartphone, FiGlobe, FiDollarSign, FiCheck } from 'react-icons/fi';
import styles from './PaymentStep.module.css';

function PaymentStep({ methods = [], selectedPaymentId, onSelectPayment, onNextStep, onPrevStep }) {
  const [upiVpa, setUpiVpa] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [selectedBank, setSelectedBank] = useState('sbi');

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

      <div className={styles.methodsList}>
        {methods.map((method) => {
          const isSelected = selectedPaymentId === method.id;

          return (
            <div key={method.id} className={styles.methodWrapper}>
              <div
                onClick={() => onSelectPayment(method.id)}
                className={`${styles.methodCard} ${isSelected ? styles.selectedCard : ''}`}
              >
                <div className={styles.cardLeft}>
                  <input
                    type="radio"
                    name="payment_method"
                    checked={isSelected}
                    onChange={() => onSelectPayment(method.id)}
                    className={styles.radio}
                  />

                  <div className={styles.iconBox}>
                    {method.id === 'pay_upi' ? (
                      <FiSmartphone className={styles.payIcon} />
                    ) : method.id === 'pay_card' ? (
                      <FiCreditCard className={styles.payIcon} />
                    ) : method.id === 'pay_netbanking' ? (
                      <FiGlobe className={styles.payIcon} />
                    ) : (
                      <FiDollarSign className={styles.payIcon} />
                    )}
                  </div>

                  <div className={styles.infoGroup}>
                    <h4 className={styles.methodName}>{method.name}</h4>
                    <p className={styles.methodDesc}>{method.desc}</p>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  {method.charge && <span className={styles.chargeTag}>+ ₹{method.charge}</span>}
                  <div className={styles.badgeRow}>
                    {method.icons.map((ic, i) => (
                      <span key={i} className={styles.iconPill}>{ic}</span>
                    ))}
                  </div>
                  {isSelected && <FiCheck className={styles.checkIcon} />}
                </div>
              </div>

              {/* Dynamic Interactive Payment Input Box */}
              {isSelected && (
                <div className={styles.detailsPanel}>
                  {method.id === 'pay_upi' && (
                    <div className={styles.upiBox}>
                      <p className={styles.boxTitle}>Scan QR or Enter UPI ID</p>
                      <div className={styles.qrRow}>
                        <div className={styles.qrCodePlaceholder}>
                          <div className={styles.qrMock}>[ QR Code ]</div>
                        </div>
                        <div className={styles.upiInputRow}>
                          <label>Enter VPA / UPI ID</label>
                          <div className={styles.upiInputWrapper}>
                            <input
                              type="text"
                              placeholder="mobile-number@upi / username@okaxis"
                              value={upiVpa}
                              onChange={(e) => setUpiVpa(e.target.value)}
                              className={styles.inputField}
                            />
                            <button type="button" className={styles.verifyBtn}>Verify</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {method.id === 'pay_card' && (
                    <div className={styles.cardBox}>
                      <p className={styles.boxTitle}>Enter Credit / Debit Card Details</p>
                      <div className={styles.cardFormGrid}>
                        <div className={styles.fullWidth}>
                          <label>Card Number</label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8920"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            className={styles.inputField}
                          />
                        </div>
                        <div>
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className={styles.inputField}
                          />
                        </div>
                        <div>
                          <label>CVV / CVC</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.fullWidth}>
                          <label>Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="Ananya Sharma"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                            className={styles.inputField}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {method.id === 'pay_netbanking' && (
                    <div className={styles.netbankBox}>
                      <p className={styles.boxTitle}>Select Popular Bank</p>
                      <div className={styles.bankGrid}>
                        {['SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`${styles.bankBtn} ${selectedBank === bank ? styles.selectedBank : ''}`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {method.id === 'pay_cod' && (
                    <div className={styles.codBox}>
                      <p className={styles.boxTitle}>Cash on Delivery Selected</p>
                      <p className={styles.codDesc}>
                        Please keep exact cash ready upon delivery. An additional convenience fee of ₹40 applies.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footerRow}>
        <button onClick={onPrevStep} className={styles.backBtn}>
          Back to Delivery
        </button>
        <button onClick={onNextStep} className={styles.nextBtn}>
          Continue to Order Review
        </button>
      </div>
    </div>
  );
}

export default PaymentStep;
