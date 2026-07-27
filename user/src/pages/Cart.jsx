import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [availableOffers, setAvailableOffers] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const cartItems = cart || [];
  const sellingTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const handleUpdateQuantity = (id, newQty) => {
    updateQuantity(id, newQty);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleMoveToWishlist = (product) => {
    api.addToWishlist(product.productId || product.id).catch(() => {});
    removeFromCart(product.id);
    alert(`"${product.name}" moved to your Wishlist!`);
  };

  const handleApplyCoupon = (code) => {
    if (!code) return;
    api.validateCoupon(code, sellingTotal)
      .then((data) => {
        if (data.success && data.coupon) {
          setAppliedCoupon({
            code: data.code,
            discountAmount: data.discountAmount,
            discountPercent: data.coupon.discountType === 'Percentage' ? data.coupon.discountValue : null
          });
          alert(`Coupon "${data.code}" applied successfully! Saved ₹${data.discountAmount}`);
        } else {
          alert(data.message || `Invalid coupon code "${code}".`);
        }
      })
      .catch((err) => {
        alert(err.message || `Could not apply coupon "${code}".`);
      });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>Cart</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.topPill}>
            <FiShoppingCart /> My Shopping Cart
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>
              My Cart <span className={styles.itemCount}>({cartItems.length} Items)</span>
            </h1>

            <button onClick={() => navigate('/shop')} className={styles.continueBtn}>
              <FiArrowLeft /> Continue Shopping
            </button>
          </div>

          <p className={styles.subtitle}>
            Review your favourite sarees and proceed to checkout.
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

        {/* You May Also Like Slider */}
        <RelatedProducts />

        {/* Recently Viewed Products Slider */}
        <RecentlyViewed />
      </div>
    </div>
  );
}

export default Cart;
