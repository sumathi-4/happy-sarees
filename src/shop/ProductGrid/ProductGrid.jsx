import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingCart, FiSearch } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import styles from './ProductGrid.module.css';

function ProductGrid({
  products,
  isLoading,
  viewMode,
  onQuickView,
  onToggleWishlist,
  onAddToCart,
  onResetFilters,
  wishlistedIds = ['p1', 'p5'] // Default mocks
}) {
  // Pulse skeleton loader
  const renderSkeletons = () => {
    return (
      <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
            <div className={`${styles.imageWrapper} ${styles.skeletonImage}`} />
            <div className={styles.metaWrapper}>
              <div className={`${styles.skeletonText} ${styles.skeletonTag}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonPrice}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonSpecs}`} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return renderSkeletons();
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrapper}>
          <FiSearch className={styles.emptyIcon} />
        </div>
        <h3 className={styles.emptyTitle}>No Sarees Found</h3>
        <p className={styles.emptyText}>
          We couldn't find any sarees matching your selected filter combinations. Try resetting the filters to explore our full collection.
        </p>
        <button onClick={onResetFilters} className={styles.resetBtn}>
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.gridWrapper}>
      <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
        {products.map((product) => {
          const isWishlisted = wishlistedIds.includes(product.id);
          const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

          return (
            <div
              key={product.id}
              className={`${styles.card} ${viewMode === 'list' ? styles.listCard : ''}`}
            >
              {/* Product Image and Overlay Actions */}
              <div className={styles.imageWrapper}>
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                </Link>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ''}`}
                  aria-label="Add to wishlist"
                >
                  <FiHeart className={styles.heartIcon} />
                </button>

                {/* Promo badges */}
                <div className={styles.badgeGroup}>
                  {product.isNew && <span className={`${styles.badge} ${styles.newBadge}`}>New</span>}
                  {discountPercent > 0 && <span className={`${styles.badge} ${styles.discountBadge}`}>{discountPercent}% OFF</span>}
                </div>

                {/* Low Stock Warning */}
                {product.inStock && product.stockCount <= 5 && (
                  <div className={styles.stockNotice}>
                    Only {product.stockCount} Left!
                  </div>
                )}
                {!product.inStock && (
                  <div className={styles.soldOutNotice}>
                    Sold Out
                  </div>
                )}

                {/* Hover Glassmorphic Overlay Buttons */}
                <div className={styles.imageOverlay}>
                  <Link
                    to={`/product/${product.id}`}
                    className={styles.overlayBtn}
                    title="Quick View Saree"
                    style={{ textDecoration: 'none' }}
                  >
                    <FiEye /> Quick View
                  </Link>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.inStock}
                    className={`${styles.overlayBtn} ${styles.primaryOverlayBtn}`}
                    title="Add to Cart"
                  >
                    <FiShoppingCart /> Add
                  </button>
                </div>
              </div>

              {/* Product Details Section */}
              <div className={styles.metaWrapper}>
                <span className={styles.productTag}>{product.fabric} weave</span>
                
                <h3 className={styles.productName}>
                  <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {product.name}
                  </Link>
                </h3>

                {/* Star rating */}
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
                  <span className={styles.ratingVal}>{product.rating}</span>
                </div>

                {/* Price tag */}
                <div className={styles.priceRow}>
                  <span className={styles.sellingPrice}>₹{product.price.toLocaleString()}</span>
                  {product.originalPrice > product.price && (
                    <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                {/* Specifications Bar */}
                <div className={styles.specBar}>
                  <span>Length: {product.height}</span>
                  <span>•</span>
                  <span>Width: {product.width}</span>
                  <span>•</span>
                  <span>Blouse: {product.blouseIncluded ? `Yes (${product.blouseSize})` : 'No'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductGrid;
