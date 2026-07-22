import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import styles from './CartItem.module.css';

function CartItem({ item, onUpdateQuantity, onRemove, onMoveToWishlist }) {
  if (!item) return null;

  return (
    <div className={styles.cartCard}>
      {/* Product Image Frame */}
      <div className={styles.imageFrame}>
        <Link to={`/product/${item.productId || item.id}`} className={styles.imageLink}>
          <img src={item.image} alt={item.name} className={styles.productImg} />
        </Link>
        {item.discountBadge && (
          <span className={styles.discountBadge}>{item.discountBadge}</span>
        )}
      </div>

      {/* Item Details Column */}
      <div className={styles.detailsCol}>
        <div className={styles.headerRow}>
          <div>
            <h3 className={styles.productName}>
              <Link to={`/product/${item.productId || item.id}`} className={styles.nameLink}>
                {item.name}
              </Link>
            </h3>
            <span className={styles.fabricText}>{item.fabric}</span>
          </div>
          {/* Trash Remove Icon */}
          <button
            onClick={() => onRemove(item.id)}
            className={styles.trashBtn}
            title="Remove item"
            aria-label="Remove item"
          >
            <FiTrash2 />
          </button>
        </div>

        {/* Spec Line matching reference layout */}
        <div className={styles.specLine}>
          {item.color && <span>Color: <strong>{item.color}</strong></span>}
          {item.color && <span className={styles.dot}>|</span>}
          <span>Blouse: <strong>{item.blouseIncluded !== false ? 'Yes' : 'No'}</strong></span>
          <span className={styles.dot}>|</span>
          <span>Width: <strong>{item.width || '48 Inches'}</strong></span>
          <span className={styles.dot}>|</span>
          <span>Height: <strong>{item.height || '6.2 Meters'}</strong></span>
        </div>

        {/* Rating */}
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`${styles.starIcon} ${
                  i < Math.floor(item.rating || 4.8) ? styles.starFilled : ''
                }`}
              />
            ))}
          </div>
          <span className={styles.ratingScore}>{item.rating || 4.8}</span>
          <span className={styles.reviewCount}>({item.ratingCount || 100})</span>
        </div>

        {/* Price & Quantity & Wishlist Action Row */}
        <div className={styles.footerRow}>
          <div className={styles.priceRow}>
            <span className={styles.sellingPrice}>₹{item.price.toLocaleString()}</span>
            {item.originalPrice > item.price && (
              <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</span>
            )}
          </div>

          <div className={styles.quantityCounter}>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className={styles.qtyBtn}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={styles.qtyVal}>{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className={styles.qtyBtn}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onMoveToWishlist(item)}
            className={styles.moveToWishlistBtn}
          >
            <FiHeart /> Move to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
