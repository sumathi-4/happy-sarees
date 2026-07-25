import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiStar, FiHeart, FiShoppingCart, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import styles from './QuickViewModal.module.css';

function QuickViewModal({ product, onClose, onAddToWishlist, onAddToCart }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(product?.isWishlisted || false);

  if (!product) return null;

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      toast.success(`Added "${product.name}" to Shopping Bag! 🛍️`);
    }
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (onAddToWishlist) {
      onAddToWishlist(product);
    } else {
      if (!isWishlisted) {
        toast.success(`Saved "${product.name}" to Wishlist! ❤️`);
      } else {
        toast.info(`Removed "${product.name}" from Wishlist.`);
      }
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
                        starIndex <= Math.round(product.rating || 4.8) ? styles.starFilled : ''
                      }`}
                    />
                  );
                })}
              </div>
              <span className={styles.ratingText}>
                {product.rating || 4.8} ({product.ratingCount || product.reviewCount || 35} Reviews)
              </span>
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
                title="Add to Wishlist"
              >
                <FiHeart className={styles.btnIcon} />
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
