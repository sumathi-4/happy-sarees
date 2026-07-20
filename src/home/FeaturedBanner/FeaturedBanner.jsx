import React from 'react';
import styles from './FeaturedBanner.module.css';

function FeaturedBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.bannerContainer}>
        <img 
          src="/src/assets/festive_saree.png" 
          alt="Royal Banarasi Collection Banner" 
          className={styles.bgImage} 
        />
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <span className={styles.tagline}>Featured Collection Showcase</span>
          <h2 className={styles.title}>Royal Banarasi Collection</h2>
          <p className={styles.desc}>
            Experience the richness of heritage weaves with modern elegance. Handloomed with pure zaris, each saree tells a tale of luxury craftsmanship.
          </p>
          <button className={styles.ctaBtn}>Shop Collection</button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBanner;
