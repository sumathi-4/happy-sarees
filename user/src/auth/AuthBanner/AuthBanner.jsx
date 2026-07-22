import React from 'react';
import styles from './AuthBanner.module.css';

function AuthBanner({ image, headline = "Timeless Sarees For Every You" }) {
  const bgImg = image || "/src/assets/hero_saree_model.png";

  return (
    <div className={styles.bannerContainer}>
      <img src={bgImg} alt="Luxury Indian Saree Fashion" className={styles.bannerImg} />
      <div className={styles.overlay}>
        <div className={styles.brandContent}>
          <h2 className={styles.headline}>{headline}</h2>
          <div className={styles.featureList}>
            <span className={styles.featurePill}>✨ Premium Quality</span>
            <span className={styles.featurePill}>🌸 Elegant Designs</span>
            <span className={styles.featurePill}>👑 Handcrafted Luxury</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthBanner;
