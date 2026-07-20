import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import {
  MOCK_CART_ITEMS,
  MOCK_ADDRESSES,
  DELIVERY_METHODS,
  PAYMENT_METHODS
} from '../data/mockData';
import CheckoutStepper from '../checkout/CheckoutStepper/CheckoutStepper';
import AddressStep from '../checkout/AddressStep/AddressStep';
import DeliveryStep from '../checkout/DeliveryStep/DeliveryStep';
import PaymentStep from '../checkout/PaymentStep/PaymentStep';
import ReviewStep from '../checkout/ReviewStep/ReviewStep';
import CheckoutSummary from '../checkout/CheckoutSummary/CheckoutSummary';
import OrderSuccessModal from '../checkout/OrderSuccessModal/OrderSuccessModal';
import EmptyCart from '../cart/EmptyCart/EmptyCart';
import styles from './Checkout.module.css';

function Checkout() {
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(MOCK_ADDRESSES[0]?.id || '');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(DELIVERY_METHODS[0]?.id || '');
  const [selectedPaymentId, setSelectedPaymentId] = useState(PAYMENT_METHODS[0]?.id || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Derived selections
  const selectedAddress = MOCK_ADDRESSES.find(a => a.id === selectedAddressId) || MOCK_ADDRESSES[0];
  const selectedDelivery = DELIVERY_METHODS.find(d => d.id === selectedDeliveryId) || DELIVERY_METHODS[0];
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  const deliveryPrice = selectedDelivery?.price || 0;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = Math.max(0, subtotal - sellingTotal + 2500);
  const grandTotal = Math.max(0, subtotal - discount + deliveryPrice);

  const handlePlaceOrder = () => {
    setShowSuccessModal(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <Link to="/cart" className={styles.crumbLink}>Cart</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>Checkout</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.topPill}>
            <FiLock /> Secure Checkout
          </div>
          <h1 className={styles.pageTitle}>Secure Checkout</h1>
          <p className={styles.subtitle}>
            Complete your order in just a few simple steps.
          </p>
        </div>

        {cartItems.length > 0 ? (
          <>
            {/* Multi-Step Stepper */}
            <CheckoutStepper activeStep={activeStep} />

            {/* Main 2-Column Grid */}
            <div className={styles.checkoutGrid}>
              {/* Left Column: Active Step Component */}
              <div className={styles.leftCol}>
                {activeStep === 1 && (
                  <AddressStep
                    addresses={MOCK_ADDRESSES}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                    onNextStep={() => setActiveStep(2)}
                  />
                )}

                {activeStep === 2 && (
                  <DeliveryStep
                    options={DELIVERY_METHODS}
                    selectedOptionId={selectedDeliveryId}
                    onSelectOption={setSelectedDeliveryId}
                    onNextStep={() => setActiveStep(3)}
                    onPrevStep={() => setActiveStep(1)}
                  />
                )}

                {activeStep === 3 && (
                  <PaymentStep
                    methods={PAYMENT_METHODS}
                    selectedPaymentId={selectedPaymentId}
                    onSelectPayment={setSelectedPaymentId}
                    onNextStep={() => setActiveStep(4)}
                    onPrevStep={() => setActiveStep(2)}
                  />
                )}

                {activeStep === 4 && (
                  <ReviewStep
                    cartItems={cartItems}
                    selectedAddress={selectedAddress}
                    selectedDelivery={selectedDelivery}
                    selectedPayment={selectedPayment}
                    grandTotal={grandTotal}
                    onPlaceOrder={handlePlaceOrder}
                    onPrevStep={() => setActiveStep(3)}
                  />
                )}
              </div>

              {/* Right Column: Sticky Summary & Trust Badges */}
              <div className={styles.rightCol}>
                <CheckoutSummary
                  cartItems={cartItems}
                  deliveryPrice={deliveryPrice}
                  discountAmount={2500}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyCart />
        )}

        {/* Order Success Modal */}
        {showSuccessModal && (
          <OrderSuccessModal
            orderId="HS-84920"
            totalAmount={grandTotal}
            address={selectedAddress}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Checkout;
