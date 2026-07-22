import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import styles from './EmptyWishlist.module.css';

function EmptyWishlist() {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.illustrationBox}>
        <div className={styles.iconCircle}>
          <FiHeart className={styles.heartIcon} />
        </div>
      </div>

      <h3 className={styles.title}>Your wishlist is empty!</h3>
      <p className={styles.subtitle}>Save your favourite sarees to view them here.</p>
      
      <button onClick={() => navigate('/shop')} className={styles.shopBtn}>
        Continue Shopping
      </button>
    </div>
  );
}

export default EmptyWishlist;
