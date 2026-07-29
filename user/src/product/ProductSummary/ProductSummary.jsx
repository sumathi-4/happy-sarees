import React, { useState } from 'react';
import { FaStar, FaHeart } from 'react-icons/fa';
import { FiHeart, FiShare2, FiShoppingCart, FiZap, FiCheckCircle, FiRefreshCw, FiTruck, FiStar } from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import styles from './ProductSummary.module.css';

function ProductSummary({ product, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product?.id);
  const [copiedToast, setCopiedToast] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  // Live dynamic rating fetched from reviews API (approved reviews only)
  const [liveRating, setLiveRating] = useState(null);
  const [liveReviewCount, setLiveReviewCount] = useState(null);

  React.useEffect(() => {
    if (product && product.id) {
      // Fetch live approved rating stats
      api.getReviews(product.id)
        .then((res) => {
          if (res && res.success) {
            setLiveRating(res.averageRating !== undefined ? Number(res.averageRating) : 0);
            setLiveReviewCount(res.count !== undefined ? Number(res.count) : 0);
          }
        })
        .catch(() => {});

      const token = localStorage.getItem('hs_token');
      if (token) {
        api.checkReviewEligibility(product.id)
          .then((res) => {
            if (res.success) {
              setCanReview(Boolean(res.canReview));
              setExistingReview(res.existingReview || null);
            }
          })
          .catch(() => setCanReview(false));
      }
    }
  }, [product]);

  if (!product) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } else {
      alert('Product link copied to clipboard!');
    }
  };

  const handleAddToCartClick = () => {
    addToCart(product, quantity);
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className={styles.summaryContainer}>
      {/* Product Name Title */}
      <h1 className={styles.productTitle}>{product.name}</h1>

      {/* Short Description */}
      {(product.shortDescription || product.short_description) && (
        <p style={{ fontSize: '14px', color: '#444444', marginTop: '8px', marginBottom: '14px', lineHeight: '1.5', fontWeight: '500' }}>
          {product.shortDescription || product.short_description}
        </p>
      )}

      {/* Rating & Reviews Bar — Live dynamic from approved reviews */}
      <div className={styles.ratingRow}>
        {/* 5-star golden fill row — same style as Quick View */}
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => {
            const displayRating = liveRating !== null ? liveRating : (product.rating || 0);
            return (
              <FiStar
                key={i}
                className={`${styles.starIcon} ${i + 1 <= Math.round(displayRating) ? styles.starFilled : ''}`}
              />
            );
          })}
        </div>
        <span className={styles.ratingScore}>
          {liveRating !== null ? Number(liveRating).toFixed(1) : (product.rating ? Number(product.rating).toFixed(1) : '0.0')}
        </span>
        <span className={styles.reviewCount}>({liveReviewCount !== null ? liveReviewCount : (product.reviewCount || 0)} Verified Reviews)</span>

        {canReview && existingReview && (existingReview.status === 'approved' || existingReview.status === 'rejected') ? (
          // Approved/Rejected: edit disabled, show status badge
          <span style={{ marginLeft: '12px', fontSize: '12px', color: existingReview.status === 'approved' ? '#15803d' : '#b91c1c', background: existingReview.status === 'approved' ? '#dcfce7' : '#fee2e2', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            {existingReview.status === 'approved' ? '✓ Review Approved' : '✗ Review Rejected'}
          </span>
        ) : canReview ? (
          <button
            onClick={() => {
              const el = document.getElementById('customer-reviews');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ marginLeft: '12px', background: '#d11b69', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            {existingReview ? 'Edit Review' : 'Write Review'}
          </button>
        ) : (
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
            Available after delivery.
          </span>
        )}
      </div>

      {/* Prices display */}
      <div className={styles.priceContainer}>
        <div className={styles.priceRow}>
          <span className={styles.sellingPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
          {product.discountBadge && (
            <span className={styles.discountBadge}>{product.discountBadge}</span>
          )}
        </div>
        <span className={styles.taxText}>Inclusive of all taxes</span>
      </div>

      {/* In Stock Notice */}
      <div className={styles.stockRow}>
        <span className={styles.stockDot}></span>
        <span className={styles.stockStatus}>In Stock</span>
        <span className={styles.stockDivider}>|</span>
        <span className={styles.shipStatus}>Ready to Ship</span>
      </div>

      {/* Quantity Selector */}
      <div className={styles.quantityRow}>
        <span className={styles.quantityLabel}>Quantity</span>
        <div className={styles.quantityCounter}>
          <button
            onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
            className={styles.qtyBtn}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className={styles.qtyVal}>{quantity}</span>
          <button
            onClick={() => setQuantity(prev => prev + 1)}
            className={styles.qtyBtn}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Secondary Actions (Wishlist & Share) */}
      <div className={styles.secondaryActions}>
        <button
          onClick={() => toggleWishlist(product)}
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.activeWishlist : ''}`}
        >
          {isWishlisted ? (
            <FaHeart className={styles.actionIcon} style={{ color: '#e91e63' }} />
          ) : (
            <FiHeart className={styles.actionIcon} />
          )}
          {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
        </button>
        <button onClick={handleShare} className={styles.shareBtn}>
          <FiShare2 className={styles.actionIcon} />
          {copiedToast ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      {/* Primary CTAs (Add to Cart / Buy Now) */}
      <div className={styles.primaryActions}>
        <button onClick={handleAddToCartClick} className={styles.addToCartBtn}>
          <FiShoppingCart className={styles.ctaIcon} />
          Add to Cart
        </button>
        <button onClick={() => onBuyNow(product, quantity)} className={styles.buyNowBtn}>
          <FiZap className={styles.ctaIcon} />
          Buy Now
        </button>
      </div>

      {/* Trust Badges */}
      <div className={styles.trustBadges}>
        <div className={styles.badgeItem}>
          <FiCheckCircle className={styles.trustIcon} />
          <span>100% Quality Assured</span>
        </div>
        <div className={styles.badgeItem}>
          <FiRefreshCw className={styles.trustIcon} />
          <span>Easy Returns</span>
        </div>
        <div className={styles.badgeItem}>
          <FiTruck className={styles.trustIcon} />
          <span>Free Shipping</span>
        </div>
      </div>
    </div>
  );
}

export default ProductSummary;
