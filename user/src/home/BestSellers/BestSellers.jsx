import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BestSellers.module.css';

function BestSellers() {
  return (
    <section className={styles.bannerSection}>
      <div className={styles.container}>
        <Link to="/shop" className={styles.bannerWrapper} aria-label="Find Your Perfect Saree with Matching Blouse - Shop Sarees with Blouse">
          <div className={styles.imageContainer}>
            <img 
              src="/images/find_your_perfect_saree_banner.png" 
              alt="Find Your Perfect Saree with Matching Blouse - Crafted in Silk - Shop Sarees with Blouse" 
              className={styles.bannerImage} 
            />
            {/* Elegant Golden Shine Sweep Animation Overlay */}
            <div className={styles.goldenShineOverlay} />
          </div>
        </Link>
      </div>
    </section>
  );
}

export default BestSellers;
