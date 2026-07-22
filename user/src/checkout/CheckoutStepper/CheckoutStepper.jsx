import React from 'react';
import { FiCheck } from 'react-icons/fi';
import styles from './CheckoutStepper.module.css';

function CheckoutStepper({ activeStep }) {
  const steps = [
    { id: 1, label: 'Shipping Address' },
    { id: 2, label: 'Delivery Options' },
    { id: 3, label: 'Payment Method' },
    { id: 4, label: 'Order Review' }
  ];

  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepperTrack}>
        {steps.map((step, index) => {
          const isCompleted = activeStep > step.id;
          const isActive = activeStep === step.id;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div
                className={`${styles.stepNode} ${
                  isCompleted ? styles.completedNode : isActive ? styles.activeNode : ''
                }`}
              >
                <div className={styles.circle}>
                  {isCompleted ? <FiCheck className={styles.checkIcon} /> : step.id}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className={`${styles.line} ${
                    activeStep > step.id ? styles.lineCompleted : ''
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default CheckoutStepper;
