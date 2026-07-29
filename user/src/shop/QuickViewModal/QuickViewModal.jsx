import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiStar, FiHeart, FiShoppingCart, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import styles from './QuickViewModal.module.css';

function QuickViewModal({ product, onClose, onAddToWishlist, onAddToCart }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product?.id);

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

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCartClick = () => {
    addToCart(product, 1);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
          <FiX />
        </button>

        <div className={styles.modalGrid}>
          {/* Left Column: Product Image (Badge Removed for Clean Look) */}
          <div className={styles.imageCol}>
            <img src={product.image} alt={product.name} className={styles.productImage} />
          </div>

          {/* Right Column: Product Info & Highlights */}
          <div className={styles.infoCol}>
            <span className={styles.fabricTag}>{product.fabric} Saree</span>
            <h3 className={styles.productName}>{product.name}</h3>

            {/* Rating Stars */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => {
                  const starIndex = i + 1;
                  return (
                    <FiStar
                      key={i}
                      className={`${styles.starIcon} ${
                        starIndex <= Math.round(liveRating !== null ? liveRating : (product.rating || 0)) ? styles.starFilled : ''
                      }`}
                    />
                  );
                })}
              </div>
              <span className={styles.ratingText}>
                {liveRating !== null ? Number(liveRating).toFixed(1) : (product.rating ? Number(product.rating).toFixed(1) : '0.0')} ({liveReviewCount !== null ? liveReviewCount : (product.reviewCount || 0)} Reviews)
              </span>

              {canReview && existingReview && (existingReview.status === 'approved' || existingReview.status === 'rejected') ? (
                // Approved/Rejected: show status badge, no edit
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: existingReview.status === 'approved' ? '#15803d' : '#b91c1c', background: existingReview.status === 'approved' ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {existingReview.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </span>
              ) : canReview ? (
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    navigate(`/product/${product.id}#customer-reviews`);
                  }}
                  style={{ marginLeft: 'auto', background: '#d11b69', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {existingReview ? 'Edit Review' : 'Write Review'}
                </button>
              ) : (
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Available after delivery.
                </span>
              )}
            </div>

            {/* Price Section */}
            <div className={styles.priceRow}>
              <span className={styles.sellingPrice}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
              )}
              {discountPercent && (
                <span className={styles.discountText}>({discountPercent}% OFF)</span>
              )}
            </div>

            {/* Dynamic Short Description */}
            {(product.shortDescription || product.short_description) && (
              <p style={{ fontSize: '13px', color: '#555555', marginTop: '8px', marginBottom: '12px', lineHeight: '1.5' }}>
                {product.shortDescription || product.short_description}
              </p>
            )}

            {/* Stock Notice */}
            <div className={styles.stockNoticeRow}>
              <span className={styles.stockDot}></span>
              <span className={styles.stockText}>In Stock</span>
              <span className={styles.stockDivider}>|</span>
              <span className={styles.shipText}>Ready to Ship</span>
            </div>

            {/* Saree Highlights (Replaced boring specifications) */}
            <div className={styles.highlightsCard}>
              <h4 className={styles.highlightsTitle}>SAREE HIGHLIGHTS</h4>
              <div className={styles.highlightsGrid}>
                <div className={styles.highlightItem}>
                  <span className={styles.itemLabel}>Fabric & Weave</span>
                  <span className={styles.itemVal}>{product.fabric} • {product.weave || 'Handloom'}</span>
                </div>
                <div className={styles.highlightItem}>
                  <span className={styles.itemLabel}>Color & Pattern</span>
                  <span className={styles.itemVal}>{product.color} • {product.pattern}</span>
                </div>
                <div className={styles.highlightItem}>
                  <span className={styles.itemLabel}>Blouse Included</span>
                  <span className={styles.itemVal}>{product.blouseIncluded ? `Yes (${product.blouseSize || '0.8m'})` : 'No'}</span>
                </div>
                <div className={styles.highlightItem}>
                  <span className={styles.itemLabel}>Saree Size</span>
                  <span className={styles.itemVal}>{product.height} x {product.width}</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className={styles.actions}>
              <button
                onClick={handleAddToCartClick}
                disabled={!product.inStock}
                className={styles.addToCartBtn}
              >
                <FiShoppingCart className={styles.btnIcon} />
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {isWishlisted ? (
                  <FaHeart className={styles.btnIcon} style={{ color: '#e91e63' }} />
                ) : (
                  <FiHeart className={styles.btnIcon} />
                )}
                {isWishlisted ? 'Saved' : 'Wishlist'}
              </button>
            </div>

            {/* View Full Product Details Link */}
            <button onClick={handleViewFullDetails} className={styles.fullDetailsBtn}>
              View Full Product Details <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
