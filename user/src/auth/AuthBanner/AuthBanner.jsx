import React from 'react';
import styles from './AuthBanner.module.css';

function AuthBanner({ image, headline = "Timeless Sarees For Every You" }) {
  const bgImg = image || "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg";

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
