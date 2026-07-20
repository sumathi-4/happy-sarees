import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingCart, FiStar, FiX } from 'react-icons/fi';
import { PRODUCTS } from '../../data/mockData';
import styles from './NewArrivals.module.css';

function NewArrivals() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(PRODUCTS.filter(p => p.isWishlisted).map(p => p.id));

  const newProducts = PRODUCTS.filter((p) => p.isNew);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Freshly Loomed masterpieces</span>
        <h2 className={styles.title}>New Arrivals</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {newProducts.map((product) => {
          const isFav = wishlist.includes(product.id);
          return (
            <div key={product.id} className={styles.card}>
              {/* Product Image & Badges */}
              <div className={styles.imageWrapper}>
                <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={product.image} alt={product.name} className={styles.image} />
                </Link>
                
                {/* Wishlist Button */}
                <button 
                  onClick={() => toggleWishlist(product.id)} 
                  className={`${styles.wishlistBtn} ${isFav ? styles.activeWishlist : ''}`}
                  aria-label="Add to Wishlist"
                >
                  <FiHeart className={styles.heartIcon} />
                </button>

                {/* Badges */}
                <div className={styles.badges}>
                  {product.discountBadge && (
                    <span className={styles.discountBadge}>{product.discountBadge}</span>
                  )}
                  {!product.inStock && (
                    <span className={styles.soldOutBadge}>Sold Out</span>
                  )}
                </div>

                {/* Quick Actions Hover Overlay */}
                <div className={styles.hoverActions}>
                  <button 
                    onClick={() => navigate(`/product/${product.id}`)} 
                    className={styles.actionBtn}
                  >
                    <FiEye /> Quick View
                  </button>
                  <button 
                    className={styles.actionBtn} 
                    disabled={!product.inStock}
                    onClick={() => alert(`"${product.name}" added to cart!`)}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className={styles.info}>
                <span className={styles.fabric}>{product.fabric}</span>
                <h3 className={styles.name}>
                  <Link to={`/product/${product.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {product.name}
                  </Link>
                </h3>
                
                {/* Rating */}
                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={i < Math.floor(product.rating) ? styles.starFilled : styles.starEmpty} 
                      />
                    ))}
                  </span>
                  <span className={styles.ratingCount}>({product.ratingCount})</span>
                </div>

                {/* Pricing */}
                <div className={styles.priceContainer}>
                  <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default NewArrivals;
