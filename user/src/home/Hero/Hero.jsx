import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HERO_SLIDES } from '../../data/mockData';
import styles from './Hero.module.css';

function Hero() {
  const navigate = useNavigate();
  const slide = HERO_SLIDES[0];

  return (
    <section className={styles.hero}>
      {/* Editorial Decorative Background Accents */}
      <div className={styles.circleBg1}></div>
      <div className={styles.circleBg2}></div>
      <div className={styles.goldLineDecoration}></div>

      <div className={styles.container}>
        {/* Editorial Text Block */}
        <div className={styles.content}>
          <span className={styles.subtitle}>{slide.subtitle}</span>
          <h2 className={styles.title}>
            {slide.title}
            <span className={styles.boldTitle}>{slide.boldTitle}</span>
          </h2>
          <p className={styles.description}>{slide.description}</p>
          <div className={styles.ctaGroup}>
            <button onClick={() => navigate('/shop')} className={styles.primaryBtn}>
              {slide.primaryCta || 'SHOP NOW'}
            </button>
            <button onClick={() => navigate('/shop')} className={styles.secondaryBtn}>
              {slide.secondaryCta || 'EXPLORE COLLECTIONS'}
            </button>
          </div>
        </div>

        {/* Arch Frame Saree Model Image */}
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <img src={slide.image} alt={slide.title} className={styles.image} />
            <div className={styles.frameOverlay}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
