import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import Badge from '../Badge/Badge';
import { useToast } from '../../../context/ToastContext';
import styles from './ProductCard.module.css';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleCardClick = (e) => {
    // If click is not on a button, navigate to Product Details page
    if (!e.target.closest('button')) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Saved "${product.name}" to Wishlist! ❤️`);
    } else {
      toast.info(`Removed "${product.name}" from Wishlist.`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    toast.success(`Added "${product.name}" to Shopping Bag! 🛍️`);
  };

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Image Frame with badges and hover actions */}
      <div className={styles.imgFrame}>
        <img src={product.image} alt={product.name} className={styles.productImg} />

        {/* Badges */}
        <div className={styles.badgeGroup}>
          {discountPercent && <Badge variant="magenta">{discountPercent}% OFF</Badge>}
          {product.badge && <Badge variant="pink">{product.badge}</Badge>}
        </div>

        {/* Floating Quick Action Buttons */}
        <div className={styles.floatingActions}>
          <button
            onClick={handleWishlistToggle}
            className={`${styles.actionIconBtn} ${isWishlisted ? styles.wishlisted : ''}`}
            aria-label="Wishlist"
            title="Add to Wishlist"
          >
            <FiHeart className={styles.heartIcon} />
          </button>
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className={styles.actionIconBtn}
            aria-label="Quick View"
            title="Quick View"
          >
            <FiEye />
          </button>
        </div>
      </div>

      {/* Meta Content */}
      <div className={styles.metaContent}>
        <span className={styles.fabricLabel}>{product.fabric}</span>
        <h4 className={styles.productTitle}>{product.name}</h4>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <FaStar className={styles.starFilled} />
            <span className={styles.ratingScore}>{product.rating || 4.8}</span>
          </div>
          <span className={styles.reviewsCount}>({product.reviewsCount || 42} reviews)</span>
        </div>

        <div className={styles.priceRow}>
          <strong className={styles.sellingPrice}>₹{product.price.toLocaleString()}</strong>
          {product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <button onClick={handleAddToCart} className={styles.cartBtn}>
          <FiShoppingCart /> Add to Bag
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
