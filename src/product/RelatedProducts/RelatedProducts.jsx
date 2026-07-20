import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import styles from './RelatedProducts.module.css';

function RelatedProducts({ products = [] }) {
  const scrollRef = useRef(null);

  if (!products.length) return null;

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Related Products</h3>
        <div className={styles.navArrows}>
          <button
            onClick={() => handleScroll('left')}
            className={styles.arrowBtn}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className={styles.arrowBtn}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className={styles.productSlider}>
        {products.map((item) => (
          <div key={item.id} className={styles.productCard}>
            <div className={styles.imageFrame}>
              <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img src={item.image} alt={item.name} className={styles.productImg} />
              </Link>
              <button className={styles.wishlistBtn} aria-label="Add to wishlist">
                <FiHeart />
              </button>
            </div>

            <div className={styles.cardMeta}>
              <h4 className={styles.productName}>
                <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </h4>
              <span className={styles.colorTag}>{item.colorTag}</span>
              <div className={styles.priceRow}>
                <span className={styles.sellingPrice}>₹{item.price.toLocaleString()}</span>
                {item.originalPrice > item.price && (
                  <span className={styles.originalPrice}>₹{item.originalPrice.toLocaleString()}</span>
                )}
                {item.rating && (
                  <span className={styles.ratingVal}>
                    <FaStar className={styles.starIcon} /> {item.rating} ({item.ratingCount})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
