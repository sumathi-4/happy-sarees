import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import styles from './WishlistCard.module.css';

function WishlistCard({ product, onRemove, onAddToCart }) {
  const navigate = useNavigate();

  if (!product) return null;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className={styles.card}>
      {/* Product Image Frame */}
      <div className={styles.imageFrame}>
        <Link to={`/product/${product.id}`} className={styles.imageLink}>
          <img src={product.image} alt={product.name} className={styles.productImg} />
        </Link>

        {/* Remove from Wishlist Heart Button */}
        <button
          onClick={() => onRemove(product.id)}
          className={styles.removeBtn}
          title="Remove from Wishlist"
          aria-label="Remove from Wishlist"
        >
          <FaHeart className={styles.heartIcon} />
        </button>

        {/* Badge Overlay */}
        <div className={styles.badgeGroup}>
          {product.badgeType === 'new' ? (
            <span className={`${styles.badge} ${styles.badgeNew}`}>NEW ARRIVAL</span>
          ) : product.badgeType === 'bestseller' ? (
            <span className={`${styles.badge} ${styles.badgeBest}`}>BEST SELLER</span>
          ) : product.discountBadge ? (
            <span className={`${styles.badge} ${styles.badgeDiscount}`}>{product.discountBadge}</span>
          ) : discountPercent > 0 ? (
            <span className={`${styles.badge} ${styles.badgeDiscount}`}>{discountPercent}% OFF</span>
          ) : null}
        </div>
      </div>

      {/* Product Meta Details */}
      <div className={styles.metaContainer}>
        <h3 className={styles.productName}>
          <Link to={`/product/${product.id}`} className={styles.nameLink}>
            {product.name}
          </Link>
        </h3>
        <span className={styles.fabricSubtitle}>{product.fabric}</span>

        {/* Star Rating Row */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`${styles.starIcon} ${
                  i < Math.floor(product.rating || 4.8) ? styles.starFilled : ''
                }`}
              />
            ))}
          </div>
          <span className={styles.ratingVal}>
            {product.rating || 4.8} ({product.ratingCount || 100})
          </span>
        </div>

        {/* Spec Rows */}
        <div className={styles.specsTable}>
          <div className={styles.specRow}>
            <span className={styles.specLabel}>Width</span>
            <span className={styles.specColon}>:</span>
            <span className={styles.specVal}>{product.width || '48 Inches'}</span>
          </div>
          <div className={styles.specRow}>
            <span className={styles.specLabel}>Height</span>
            <span className={styles.specColon}>:</span>
            <span className={styles.specVal}>{product.height || '6.2 Meters'}</span>
          </div>
          <div className={styles.specRow}>
            <span className={styles.specLabel}>Blouse Included</span>
            <span className={styles.specColon}>:</span>
            <span className={styles.specVal}>{product.blouseIncluded !== false ? 'Yes' : 'No'}</span>
          </div>
        </div>

        {/* Stock Tag */}
        <div className={styles.stockRow}>
          <span className={styles.stockDot}></span>
          <span className={styles.stockText}>{product.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
        </div>

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.sellingPrice}>₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actionGrid}>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className={styles.viewDetailsBtn}
          >
            View Details
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.inStock === false}
            className={styles.addToCartBtn}
          >
            <FiShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;
