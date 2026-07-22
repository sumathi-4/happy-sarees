import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHeart } from 'react-icons/fi';
import styles from './RecentlyViewed.module.css';

function RecentlyViewed({ products = [] }) {
  const scrollRef = useRef(null);

  if (!products.length) return null;

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Recently Viewed</h3>
        <button onClick={handleScroll} className={styles.arrowBtn} aria-label="Scroll right">
          <FiChevronRight />
        </button>
      </div>

      <div ref={scrollRef} className={styles.slider}>
        {products.map((item) => (
          <div key={item.id} className={styles.miniCard}>
            <div className={styles.imageFrame}>
              <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img src={item.image} alt={item.name} className={styles.miniImg} />
              </Link>
              <button className={styles.wishlistBtn} aria-label="Add to wishlist">
                <FiHeart />
              </button>
            </div>
            <div className={styles.meta}>
              <h4 className={styles.productName}>
                <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {item.name}
                </Link>
              </h4>
              <span className={styles.price}>₹{item.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyViewed;
