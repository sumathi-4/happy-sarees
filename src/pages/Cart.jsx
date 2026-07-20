import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import {
  MOCK_CART_ITEMS,
  AVAILABLE_OFFERS,
  RECOMMENDED_PRODUCTS,
  SAMPLE_PRODUCT_DETAIL
} from '../data/mockData';
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
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [appliedCoupon, setAppliedCoupon] = useState(AVAILABLE_OFFERS.find(o => o.code === 'FREESHIP') || null);

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty < 1) {
      handleRemove(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemove = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveToWishlist = (product) => {
    setCartItems(prev => prev.filter(item => item.id !== product.id));
    alert(`"${product.name}" moved to your Wishlist!`);
  };

  const handleApplyCoupon = (code) => {
    const foundOffer = AVAILABLE_OFFERS.find(
      o => o.code.toLowerCase() === code.toLowerCase()
    );
    if (foundOffer) {
      setAppliedCoupon(foundOffer);
      alert(`Coupon "${foundOffer.code}" applied successfully!`);
    } else {
      alert(`Invalid coupon code "${code}". Try FESTIVE10 or HSFS500.`);
    }
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
                offers={AVAILABLE_OFFERS}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
              />
            </div>
          </div>
        ) : (
          <EmptyCart />
        )}

        {/* You May Also Like Slider */}
        <RelatedProducts products={RECOMMENDED_PRODUCTS} />

        {/* Recently Viewed Products Slider */}
        <RecentlyViewed products={SAMPLE_PRODUCT_DETAIL.recentlyViewed} />
      </div>
    </div>
  );
}

export default Cart;
