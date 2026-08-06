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

  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  // Dynamic Payment Methods state (Live from Neon DB via /api/cms/payment-methods)
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    codEnabled: true,
    codMaxAmount: 5000
  });

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
        
        const enable = rules.enable_free_shipping !== undefined ? rules.enable_free_shipping : (rules.enableFreeShipping !== undefined ? rules.enableFreeShipping : true);
        const minAmt = rules.free_shipping_min_amount !== undefined ? rules.free_shipping_min_amount : (rules.minFreeShippingOrder !== undefined ? rules.minFreeShippingOrder : 2999);

        setDeliveryMethods(methods);
        setShippingRules({
          enable_free_shipping: !!enable,
          enableFreeShipping: !!enable,
          free_shipping_min_amount: Number(minAmt) || 2999,
          minFreeShippingOrder: Number(minAmt) || 2999
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

  // Load Dynamic Payment Methods from Neon DB
  useEffect(() => {
    let isMounted = true;
    setPaymentMethodsLoading(true);
    api.getPaymentMethods()
      .then((data) => {
        if (!isMounted) return;
        const methods = data.paymentMethods || data.methods || [];
        const settings = data.paymentSettings || {};
        setPaymentMethods(methods);
        setPaymentSettings({
          razorpayEnabled: settings.razorpayEnabled !== false && settings.razorpay_enabled !== false,
          codEnabled: settings.codEnabled !== false && settings.cod_enabled !== false,
          codMaxAmount: Number(settings.codMaxAmount || settings.cod_max_amount || 5000),
          razorpayKey: settings.razorpayKey || settings.razorpay_key || ''
        });

        if (methods.length > 0) {
          setSelectedPaymentId(methods[0].id);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const defaults = [
          {
            id: 'pay_online',
            name: 'Pay Online',
            title: 'Pay Online',
            desc: 'Secure online payment powered by Razorpay. Supports UPI, Cards, Net Banking and Wallets.',
            icons: ['UPI', 'Cards', 'Net Banking', 'Wallets']
          },
          {
            id: 'pay_cod',
            name: 'Cash on Delivery (COD)',
            title: 'Cash on Delivery (COD)',
            desc: 'Pay in cash or UPI when your saree arrives at your doorstep.',
            maxAmount: 5000,
            icons: ['COD']
          }
        ];
        setPaymentMethods(defaults);
        setSelectedPaymentId(defaults[0].id);
      })
      .finally(() => {
        if (isMounted) setPaymentMethodsLoading(false);
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
  const selectedPayment = paymentMethods.find(p => p.id === selectedPaymentId) || paymentMethods[0];

  const [calculatedTotals, setCalculatedTotals] = useState(null);
  const [totalsLoading, setTotalsLoading] = useState(false);

  // Fetch dynamic calculations from backend
  useEffect(() => {
    if (cartItems.length === 0) return;
    let isMounted = true;
    setTotalsLoading(true);
    api.calculateOrderTotals({
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId || item.id,
        quantity: item.quantity,
        price: item.price,
        is_saree_crown: item.is_saree_crown || false
      })),
      shippingMethodId: selectedDeliveryId || null,
      couponCode: appliedCoupon?.code || null
    })
    .then(data => {
      if (isMounted && data.success) {
        setCalculatedTotals(data);
      }
    })
    .catch(err => {
      console.warn('[Checkout] Failed to fetch server totals:', err.message);
    })
    .finally(() => {
      if (isMounted) setTotalsLoading(false);
    });

    return () => { isMounted = false; };
  }, [cartItems, selectedDeliveryId, appliedCoupon]);

  // Dynamic price calculation including free shipping logic
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const clientDiscount = Math.max(0, (cartSubtotal - sellingTotal) + couponDiscount);

  const freeShippingActive = shippingRules.enable_free_shipping !== false && shippingRules.enableFreeShipping !== false;
  const minOrderAmount = Number(shippingRules.free_shipping_min_amount || shippingRules.minFreeShippingOrder || 2999);
  const qualifiesForFreeShipping = freeShippingActive && sellingTotal >= minOrderAmount;

  const getRawDeliveryCharge = () => {
    if (!selectedDelivery) return 0;
    return Number(selectedDelivery.shipping_charge !== undefined ? selectedDelivery.shipping_charge : (selectedDelivery.price !== undefined ? selectedDelivery.price : 0));
  };
  const clientDeliveryPrice = (qualifiesForFreeShipping && selectedDelivery?.free_shipping_eligible)
    ? 0
    : getRawDeliveryCharge();

  // Authoritative overrides
  const subtotal = calculatedTotals ? calculatedTotals.subtotal : cartSubtotal;
  const discount = calculatedTotals ? calculatedTotals.discount : clientDiscount;
  const deliveryPrice = calculatedTotals ? calculatedTotals.shippingAmount : clientDeliveryPrice;
  const grandTotal = calculatedTotals ? calculatedTotals.finalTotal : Math.max(0, cartSubtotal - discount + deliveryPrice);
  const gstAmount = calculatedTotals ? calculatedTotals.gstAmount : 0;
  const gstRate = calculatedTotals ? calculatedTotals.gstRate : 0;
  const taxInclusivityMode = calculatedTotals ? calculatedTotals.taxInclusivityMode : 'Tax Inclusive (Prices include GST)';

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [utrNumber, setUtrNumber] = useState('');

  // Dynamic Razorpay Script Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    const isOnline = selectedPayment?.id === 'pay_online' || selectedPayment?.type === 'online' || selectedPayment?.gateway === 'razorpay';
    const isUpiQr = selectedPayment?.id === 'pay_upi_qr' || selectedPayment?.type === 'upi_qr' || selectedPayment?.gateway === 'upi_qr';

    if (!isOnline) {
      // ── CASH ON DELIVERY (COD) & UPI QR SCANNER FLOW ──
      const orderPayload = {
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
          is_saree_crown: item.is_saree_crown || false
        })),
        totalAmount: grandTotal,
        shippingAddress: selectedAddress,
        paymentMethod: isUpiQr ? 'UPI / QR Code Scanner' : (selectedPayment?.title || selectedPayment?.name || 'Cash on Delivery (COD)'),
        paymentStatus: isUpiQr ? 'Pending Verification' : 'Pending',
        payment_status: isUpiQr ? 'Pending Verification' : 'pending',
        transactionId: isUpiQr ? (utrNumber || null) : null,
        couponCode: appliedCoupon?.code || null,
        shippingMethodId: selectedDelivery?.id || null
      };

      try {
        setCheckoutLoading(true);
        const data = await api.createOrder(orderPayload);
        if (data.success && data.order) {
          setCreatedOrderNumber(data.order.orderNumber || `HS-${Date.now()}`);
        }
        if (clearCart) await clearCart();
        setShowSuccessModal(true);
      } catch (err) {
        console.error('[Checkout Error]:', err);
        alert(err.response?.data?.message || 'Failed to place order. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }
      return;
    }

    // ── PAY ONLINE (RAZORPAY AUTOMATIC PAYMENT VERIFICATION) FLOW ──
    try {
      setCheckoutLoading(true);

      // 1. Create Razorpay Payment Session FIRST (Without creating DB order yet)
      const razorpayApiRes = await api.createRazorpayOrder({
        amount: grandTotal,
        currency: 'INR',
        items: cartItems.map(item => ({
          id: item.id,
          productId: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
          is_saree_crown: item.is_saree_crown || false
        })),
        shippingMethodId: selectedDelivery?.id || null,
        couponCode: appliedCoupon?.code || null
      });

      const razorpayData = razorpayApiRes.data || razorpayApiRes;
      if (!razorpayData.success || !razorpayData.razorpayOrderId) {
        alert(razorpayData.message || 'Failed to initialize Razorpay payment session. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      // 2. Load Razorpay SDK Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your network connection.');
        setCheckoutLoading(false);
        return;
      }

      // 3. Configure Razorpay Popup Options
      const options = {
        key: razorpayData.keyId || paymentSettings.razorpayKey || 'rzp_test_TIsRdBOnjlnxgt',
        amount: razorpayData.amount,
        currency: razorpayData.currency || 'INR',
        name: 'Happy Sarees',
        description: 'Happy Sarees Web Checkout Payment',
        image: 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg',
        order_id: razorpayData.razorpayOrderId,
        handler: async function (response) {
          try {
            setCheckoutLoading(true);

            // 4. Payment Succeeded 100%! NOW Create the Order in DB as PAID
            const orderPayload = {
              items: cartItems.map(item => ({
                id: item.id,
                productId: item.productId || item.id,
                quantity: item.quantity,
                price: item.price,
                is_saree_crown: item.is_saree_crown || false
              })),
              totalAmount: grandTotal,
              shippingAddress: selectedAddress,
              paymentMethod: 'Pay Online',
              paymentStatus: 'Paid',
              payment_status: 'Paid',
              transactionId: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              couponCode: appliedCoupon?.code || null,
              shippingMethodId: selectedDelivery?.id || null
            };

            const dbOrderRes = await api.createOrder(orderPayload);
            const dbOrder = dbOrderRes.data?.order || dbOrderRes.order || { id: Date.now(), orderNumber: `HS-${Date.now()}` };

            // 5. Verify Razorpay Signature in Backend
            try {
              await api.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: dbOrder.id,
                orderNumber: dbOrder.orderNumber,
                amount: grandTotal
              });
            } catch (vErr) {
              console.warn('[Razorpay Verification Warning]:', vErr.message);
            }

            if (clearCart) await clearCart();
            setCreatedOrderNumber(dbOrder.orderNumber || dbOrder.order_number || `HS-${Date.now()}`);
            setShowSuccessModal(true);
          } catch (verifyErr) {
            console.error('[Payment Order Creation Error]:', verifyErr);
            alert('Payment was received, but creating order failed. Please contact store support with Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setCheckoutLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay Modal Dismissed by User]');
            setCheckoutLoading(false);
            alert('Payment cancelled. No order was created. You can click Place Order to try again.');
          }
        },
        prefill: {
          name: selectedAddress?.name || 'Valued Customer',
          email: selectedAddress?.email || 'customer@happysarees.com',
          contact: selectedAddress?.phone || '9876543210'
        },
        theme: {
          color: '#27189d'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('[Razorpay Payment Failed]:', response.error);
        alert(`Payment Failed: ${response.error.description || 'Transaction declined.'} No order was created.`);
        setCheckoutLoading(false);
      });

      setCheckoutLoading(false);
      rzp.open();

    } catch (err) {
      console.error('[Online Checkout Error]:', err);
      alert(err.response?.data?.message || err.message || 'Razorpay checkout initialization failed.');
      setCheckoutLoading(false);
    }
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
                    methods={paymentMethods}
                    selectedPaymentId={selectedPaymentId}
                    onSelectPayment={setSelectedPaymentId}
                    onNextStep={() => setActiveStep(4)}
                    onPrevStep={() => setActiveStep(2)}
                    grandTotal={grandTotal}
                    codMaxAmount={paymentSettings.codMaxAmount}
                    loading={paymentMethodsLoading}
                    utrNumber={utrNumber}
                    setUtrNumber={setUtrNumber}
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
                    loading={checkoutLoading}
                  />
                )}
              </div>

              {/* Right Column: Sticky Summary & Trust Badges */}
              <div className={styles.rightCol}>
                <CheckoutSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  discount={discount}
                  gstAmount={gstAmount}
                  gstRate={gstRate}
                  shippingAmount={deliveryPrice}
                  grandTotal={grandTotal}
                  taxInclusivityMode={taxInclusivityMode}
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
