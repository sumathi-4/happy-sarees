import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PromotionalBanner.module.css';
const promoBannerImg = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476998/happy_sarees/site_assets/hero_banners/rtg73ngzkyutzme47lxm.jpg';

function PromotionalBanner() {
  const navigate = useNavigate();

  const handleBannerClick = () => {
    navigate('/sale');
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div 
          className={styles.bannerWrapper} 
          onClick={handleBannerClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleBannerClick()}
          aria-label="The Grand Saree Sale - Flat 40% to 50% Off. Click to shop sale."
        >
          <img 
            src={promoBannerImg} 
            alt="The Grand Saree Sale - Flat 40% to 50% Off" 
            className={styles.bannerImage}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default PromotionalBanner;
