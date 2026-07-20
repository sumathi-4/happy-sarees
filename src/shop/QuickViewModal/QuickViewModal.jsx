import React from 'react';
import { FiX, FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';
import styles from './QuickViewModal.module.css';

function QuickViewModal({ product, onClose, onAddToWishlist, onAddToCart }) {
  if (!product) return null;

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
          <FiX />
        </button>

        <div className={styles.modalGrid}>
          {/* Left Column: Product Image */}
          <div className={styles.imageCol}>
            <img src={product.image} alt={product.name} className={styles.productImage} />
            {discountPercent > 0 && (
              <span className={styles.discountBadge}>{discountPercent}% OFF</span>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className={styles.infoCol}>
            <span className={styles.fabricTag}>{product.fabric} Saree</span>
            <h3 className={styles.productName}>{product.name}</h3>

            {/* Rating verification */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => {
                  const starIndex = i + 1;
                  return (
                    <FiStar
                      key={i}
                      className={`${styles.starIcon} ${
                        starIndex <= Math.round(product.rating) ? styles.starFilled : ''
                      }`}
                    />
                  );
                })}
              </div>
              <span className={styles.ratingText}>({product.ratingCount} Reviews)</span>
            </div>

            {/* Price section */}
            <div className={styles.priceRow}>
              <span className={styles.sellingPrice}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Specifications Details */}
            <div className={styles.specsTable}>
              <h4 className={styles.specsTitle}>Specifications</h4>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Saree Dimensions</span>
                <span className={styles.specValue}>{product.height} x {product.width}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Blouse Included</span>
                <span className={styles.specValue}>{product.blouseIncluded ? 'Yes' : 'No'}</span>
              </div>
              {product.blouseIncluded && (
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Blouse Length</span>
                  <span className={styles.specValue}>{product.blouseSize}</span>
                </div>
              )}
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Availability</span>
                <span className={styles.specValue}>
                  {product.inStock ? (
                    <span className={styles.inStockText}>In Stock ({product.stockCount} left)</span>
                  ) : (
                    <span className={styles.outOfStockText}>Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className={styles.actions}>
              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock}
                className={styles.addToCartBtn}
              >
                <FiShoppingCart className={styles.btnIcon} />
                Add to Cart
              </button>
              <button
                onClick={() => onAddToWishlist(product)}
                className={styles.wishlistBtn}
                title="Add to Wishlist"
              >
                <FiHeart className={styles.btnIcon} />
                Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
