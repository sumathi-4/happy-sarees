import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './RecentlyViewed.module.css';

function RecentlyViewed({ products: passedProducts = [] }) {
  const scrollRef = useRef(null);
  const [items, setItems] = useState(passedProducts);
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (passedProducts && passedProducts.length > 0) {
      setItems(passedProducts);
      return;
    }

    let isMounted = true;
    if (isAuthenticated) {
      api.getRecentlyViewed()
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.products) && data.products.length > 0) {
            setItems(data.products);
          } else {
            try {
              const saved = JSON.parse(localStorage.getItem('hs_recently_viewed') || '[]');
              if (isMounted) setItems(saved);
            } catch (e) {
              if (isMounted) setItems([]);
            }
          }
        })
        .catch(() => {
          try {
            const saved = JSON.parse(localStorage.getItem('hs_recently_viewed') || '[]');
            if (isMounted) setItems(saved);
          } catch (e) {
            if (isMounted) setItems([]);
          }
        });
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('hs_recently_viewed') || '[]');
        if (isMounted) setItems(saved);
      } catch (e) {
        if (isMounted) setItems([]);
      }
    }

    return () => { isMounted = false; };
  }, [passedProducts, isAuthenticated]);

  if (!items.length) return null;

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
        {items.map((item) => {
          const isWish = isInWishlist(item.id);
          return (
            <div key={item.id} className={styles.miniCard}>
              <div className={styles.imageFrame}>
                <Link to={`/product/${item.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={item.image} alt={item.name} className={styles.miniImg} />
                </Link>
                <button
                  onClick={() => toggleWishlist(item)}
                  className={styles.wishlistBtn}
                  aria-label="Add to wishlist"
                >
                  {isWish ? <FaHeart style={{ color: '#e91e63' }} /> : <FiHeart />}
                </button>
              </div>
              <div className={styles.meta}>
                <h4 className={styles.productName}>
                  <Link to={`/product/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                </h4>
                <span className={styles.price}>₹{Number(item.price).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentlyViewed;
