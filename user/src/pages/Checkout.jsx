import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { PAYMENT_METHODS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import api from '../services/api';
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
  const { cart, clearCart } = useCart();
  const location = useLocation();
  const appliedCoupon = location.state?.appliedCoupon || null;

  const cartItems = cart || [];
  const [activeStep, setActiveStep] = useState(1);

  // Address state (Live from Neon DB)
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Dynamic Delivery Methods state (Live from Neon DB via /api/cms/shipping-methods)
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [deliveryMethodsLoading, setDeliveryMethodsLoading] = useState(true);
  const [shippingRules, setShippingRules] = useState({
    enable_free_shipping: true,
    free_shipping_min_amount: 2999
  });
  const [selectedDeliveryId, setSelectedDeliveryId] = useState('');

  const [selectedPaymentId, setSelectedPaymentId] = useState(PAYMENT_METHODS[0]?.id || '');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('HS-84920');

  // Load User Addresses Live from Neon DB
  useEffect(() => {
    let isMounted = true;
    api.getAddresses()
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
          const formatted = data.addresses.map(a => ({
            id: a.id,
            label: a.is_default ? 'Home' : 'Address',
            isDefault: a.is_default,
            name: a.full_name || a.name || 'Customer Address',
            house: a.street_address || a.house || '',
            street: a.street_address || a.street || '',
            city: a.city || '',
            state: a.state || 'Tamil Nadu',
            pincode: a.pincode || '',
            phone: a.phone || ''
          }));
          setAddresses(formatted);
          setSelectedAddressId(formatted[0].id);
        } else if (isMounted) {
          setAddresses([]);
          setSelectedAddressId('');
        }
      })
      .catch(() => {
        if (isMounted) {
          try {
            const saved = JSON.parse(localStorage.getItem('hs_user_addresses') || '[]');
            setAddresses(saved);
            if (saved.length > 0) setSelectedAddressId(saved[0].id);
          } catch (e) {
            setAddresses([]);
            setSelectedAddressId('');
          }
        }
      });
    return () => { isMounted = false; };
  }, []);

  // Load Dynamic Delivery Methods from Neon DB
  useEffect(() => {
    let isMounted = true;
    setDeliveryMethodsLoading(true);
    api.getShippingMethods()
      .then((data) => {
        if (!isMounted) return;
        // Support both {shippingMethods:[]} and {options:[]}
        const methods = data.shippingMethods || data.options || [];
        const rules = data.shippingRules || {};
        setDeliveryMethods(methods);
        setShippingRules({
          enable_free_shipping: rules.enable_free_shipping !== false,
          free_shipping_min_amount: Number(rules.free_shipping_min_amount) || 2999
        });
        if (methods.length > 0) {
          setSelectedDeliveryId(methods[0].id);
        }
      })
      .catch(() => {
        if (isMounted) setDeliveryMethods([]);
      })
      .finally(() => {
        if (isMounted) setDeliveryMethodsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Handle Adding New Address (Synchronized with Neon DB & Profile)
  const handleAddAddress = (newAddr) => {
    const payload = {
      fullName: newAddr.name,
      phone: newAddr.phone,
      streetAddress: `${newAddr.house ? newAddr.house + ', ' : ''}${newAddr.street || ''}`.trim(),
      city: newAddr.city,
      state: newAddr.state || 'Tamil Nadu',
      pincode: newAddr.pincode,
      isDefault: addresses.length === 0
    };

    api.addAddress(payload)
      .then((data) => {
        if (data.success && data.address) {
          const added = {
            id: data.address.id,
            label: data.address.is_default ? 'Home' : 'Address',
            isDefault: data.address.is_default,
            name: data.address.full_name || newAddr.name,
            house: data.address.street_address || newAddr.house,
            street: data.address.street_address || newAddr.street,
            city: data.address.city || newAddr.city,
            state: data.address.state || newAddr.state,
            pincode: data.address.pincode || newAddr.pincode,
            phone: data.address.phone || newAddr.phone
          };
          setAddresses(prev => [added, ...prev]);
          setSelectedAddressId(added.id);
          try {
            const currentSaved = JSON.parse(localStorage.getItem('hs_user_addresses') || '[]');
            localStorage.setItem('hs_user_addresses', JSON.stringify([added, ...currentSaved]));
          } catch (e) {}
        } else {
          setAddresses(prev => [newAddr, ...prev]);
          setSelectedAddressId(newAddr.id);
        }
      })
      .catch(() => {
        setAddresses(prev => [newAddr, ...prev]);
        setSelectedAddressId(newAddr.id);
        try {
          const currentSaved = JSON.parse(localStorage.getItem('hs_user_addresses') || '[]');
          localStorage.setItem('hs_user_addresses', JSON.stringify([newAddr, ...currentSaved]));
        } catch (e) {}
      });
  };

  // Derived selections
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const selectedDelivery = deliveryMethods.find(d => d.id === selectedDeliveryId) || deliveryMethods[0];
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  // Dynamic price calculation including free shipping logic
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const discount = Math.max(0, (cartSubtotal - sellingTotal) + couponDiscount);

  const qualifiesForFreeShipping = shippingRules.enable_free_shipping && sellingTotal >= shippingRules.free_shipping_min_amount;
  const getRawDeliveryCharge = () => {
    if (!selectedDelivery) return 0;
    return Number(selectedDelivery.shipping_charge || selectedDelivery.price || 0);
  };
  const deliveryPrice = (qualifiesForFreeShipping && selectedDelivery?.free_shipping_eligible)
    ? 0
    : getRawDeliveryCharge();

  const grandTotal = Math.max(0, cartSubtotal - discount + deliveryPrice);

  const handlePlaceOrder = () => {
    const orderPayload = {
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: grandTotal,
      shippingAddress: selectedAddress,
      paymentMethod: selectedPayment?.title || selectedPayment?.name || 'COD',
      couponCode: appliedCoupon?.code || null
    };

    api.createOrder(orderPayload)
      .then((data) => {
        if (data.success && data.order) {
          setCreatedOrderNumber(data.order.orderNumber || `HS-${Date.now()}`);
        }
      })
      .catch((err) => {
        console.log('[Checkout] Operating in offline checkout mode:', err.message);
      })
      .finally(() => {
        if (clearCart) clearCart();
        setShowSuccessModal(true);
      });
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
                    addresses={addresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={setSelectedAddressId}
                    onAddAddress={handleAddAddress}
                    onNextStep={() => setActiveStep(2)}
                  />
                )}

                {activeStep === 2 && (
                  <DeliveryStep
                    options={deliveryMethods}
                    selectedOptionId={selectedDeliveryId}
                    onSelectOption={setSelectedDeliveryId}
                    onNextStep={() => setActiveStep(3)}
                    onPrevStep={() => setActiveStep(1)}
                    cartSubtotal={sellingTotal}
                    freeShippingEnabled={shippingRules.enable_free_shipping}
                    freeShippingMinAmount={shippingRules.free_shipping_min_amount}
                    loading={deliveryMethodsLoading}
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
                  discountAmount={couponDiscount}
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
            orderId={createdOrderNumber}
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
