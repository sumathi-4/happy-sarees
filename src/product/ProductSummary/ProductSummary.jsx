import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiHeart, FiShare2, FiShoppingCart, FiZap, FiCheckCircle, FiRefreshCw, FiTruck } from 'react-icons/fi';
import styles from './ProductSummary.module.css';

function ProductSummary({ product, onAddToCart, onBuyNow }) {
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  if (!product) return null;

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setDeliveryResult({
        success: true,
        date: 'Thursday, 24th July',
        cod: true
      });
    } else {
      setDeliveryResult({
        success: false,
        message: 'Please enter a valid 6-digit Pincode.'
      });
    }
  };

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

      {/* Specs Grid (Matching reference wireframe) */}
      <div className={styles.specsGrid}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Fabric</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.fabric}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Color</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.color}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Width</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.width}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Pattern</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.pattern}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Height</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.height}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Occasion</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.occasion}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Blouse Included</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.blouseIncluded ? 'Yes' : 'No'}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Weave</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.weave || 'Handloom'}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Blouse Size</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.blouseSize}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>SKU</span>
          <span className={styles.specColon}>:</span>
          <span className={styles.specVal}>{product.sku}</span>
        </div>
      </div>

      {/* In Stock Notice */}
      <div className={styles.stockRow}>
        <span className={styles.stockDot}></span>
        <span className={styles.stockStatus}>In Stock</span>
        <span className={styles.stockDivider}>|</span>
        <span className={styles.shipStatus}>Ready to Ship</span>
      </div>

      {/* Deliver to Pincode UI */}
      <div className={styles.pincodeBox}>
        <form onSubmit={handleCheckPincode} className={styles.pincodeForm}>
          <label htmlFor="pincode-input" className={styles.pincodeLabel}>Deliver to</label>
          <input
            id="pincode-input"
            type="text"
            placeholder="Enter Pincode"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
            className={styles.pincodeInput}
          />
          <button type="submit" className={styles.pincodeBtn}>Check</button>
        </form>
        {deliveryResult && (
          <div className={styles.deliveryMsg}>
            {deliveryResult.success ? (
              <p className={styles.deliverySuccess}>
                ✓ Estimated Delivery by <strong>{deliveryResult.date}</strong>. Cash on Delivery Available.
              </p>
            ) : (
              <p className={styles.deliveryError}>{deliveryResult.message}</p>
            )}
          </div>
        )}
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
