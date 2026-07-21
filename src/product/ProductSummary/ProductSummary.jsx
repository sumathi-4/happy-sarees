import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiHeart, FiShare2, FiShoppingCart, FiZap, FiCheckCircle, FiRefreshCw, FiTruck } from 'react-icons/fi';
import styles from './ProductSummary.module.css';

function ProductSummary({ product, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

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

  return (
    <div className={styles.summaryContainer}>
      {/* Product Name Title */}
      <h1 className={styles.productTitle}>{product.name}</h1>

      {/* Ratings & Reviews bar */}
      <div className={styles.ratingRow}>
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`${styles.starIcon} ${
                i < Math.floor(product.rating) ? styles.starFilled : ''
              }`}
            />
          ))}
        </div>
        <span className={styles.ratingScore}>{product.rating}</span>
        <span className={styles.reviewCount}>({product.reviewCount} Reviews)</span>
        <span className={styles.ratingDivider}>|</span>
        <a href="#customer-reviews" className={styles.writeReviewLink}>Write a Review</a>
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
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.activeWishlist : ''}`}
        >
          <FiHeart className={styles.actionIcon} />
          {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
        </button>
        <button onClick={handleShare} className={styles.shareBtn}>
          <FiShare2 className={styles.actionIcon} />
          {copiedToast ? 'Link Copied!' : 'Share'}
        </button>
      </div>

      {/* Primary CTAs (Add to Cart / Buy Now) */}
      <div className={styles.primaryActions}>
        <button onClick={() => onAddToCart(product, quantity)} className={styles.addToCartBtn}>
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
