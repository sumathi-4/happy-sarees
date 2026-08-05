import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import CartItem from '../cart/CartItem/CartItem';
import OrderSummary from '../cart/OrderSummary/OrderSummary';
import AvailableOffers from '../cart/AvailableOffers/AvailableOffers';
import EmptyCart from '../cart/EmptyCart/EmptyCart';
import WhyShopWithUs from '../cart/WhyShopWithUs/WhyShopWithUs';
import RelatedProducts from '../product/RelatedProducts/RelatedProducts';
import RecentlyViewed from '../product/RecentlyViewed/RecentlyViewed';
import styles from './Cart.module.css';

function Cart({ isProfileView = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [availableOffers, setAvailableOffers] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const cartItems = cart || [];
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleApplyCoupon = useCallback(async (coupon) => {
    if (!coupon) {
      setAppliedCoupon(null);
      return;
    }

    const code = typeof coupon === 'string' ? coupon : coupon.code;

    try {
      const response = await api.validateCoupon(code, sellingTotal);
      if (response.success && response.valid) {
        setAppliedCoupon({
          ...response.coupon,
          discountPercent: response.coupon.discountType === 'Percentage' ? response.coupon.discountValue : null,
          discountAmount: response.coupon.discountType === 'Flat' ? response.coupon.discountValue : 0
        });
      } else {
        alert(response.message || 'Invalid coupon code.');
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to validate coupon.');
    }
  }, [sellingTotal]);

  useEffect(() => {
    let isMounted = true;
    api.getAvailableCoupons()
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.offers)) {
          setAvailableOffers(data.offers);
        }
      })
      .catch((err) => {
        console.warn('[Cart] Live coupons fetch warning:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  // Auto apply coupon if redirected from Claim Reward
  useEffect(() => {
    if (location.state?.autoApplyCoupon && cartItems.length > 0) {
      const couponCode = location.state.autoApplyCoupon;
      // Clear navigation state so it doesn't trigger repeatedly
      navigate(location.pathname, { replace: true, state: {} });
      handleApplyCoupon(couponCode);
    }
  }, [location.state, cartItems.length, navigate, location.pathname, handleApplyCoupon]);

  const handleUpdateQuantity = (id, newQty) => {
    updateQuantity(id, newQty);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleMoveToWishlist = (item) => {
    removeFromCart(item.id);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.topPill}>
            <span className={styles.bagIcon}>🛍️</span> MY SHOPPING BAG
          </div>
          <h1 className={styles.pageTitle}>
            Shopping Cart <span className={styles.itemCount}>({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
          </h1>
          <p className={styles.headerSubtitle}>
            Review your handpicked saree selections and proceeding to checkout.
          </p>
        </div>

        {/* Main Layout Grid OR Empty Cart State */}
        {cartItems.length > 0 ? (
          <div className={styles.cartGrid}>
            {/* Left Column: Cart Items List */}
            <div className={styles.leftCol}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  onMoveToWishlist={handleMoveToWishlist}
                />
              ))}

              {/* Why Shop With Us Trust Banner */}
              <WhyShopWithUs />
            </div>

            {/* Right Column: Sticky Summary & Offers */}
            <div className={styles.rightCol}>
              <OrderSummary
                items={cartItems}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
              />
              <AvailableOffers
                offers={availableOffers}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
              />
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}

        {/* Standalone Full-Width Sliders */}
        {!isProfileView && (
          <>
            {/* You May Also Like Slider */}
            <RelatedProducts />

            {/* Recently Viewed Products Slider */}
            <RecentlyViewed />
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
