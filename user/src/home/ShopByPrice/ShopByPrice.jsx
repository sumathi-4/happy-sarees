import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './ShopByPrice.module.css';

const PRICE_CATEGORIES = [
  {
    id: 1,
    title: '₹999 & Below',
    subtitle: 'COLLECTIONS',
    minPrice: 0,
    maxPrice: 999,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    title: '₹1,000 – ₹1,999',
    subtitle: 'COLLECTIONS',
    minPrice: 1000,
    maxPrice: 1999,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 3,
    title: '₹2,000 – ₹2,999',
    subtitle: 'COLLECTIONS',
    minPrice: 2000,
    maxPrice: 2999,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 4,
    title: '₹3,000 – ₹4,999',
    subtitle: 'COLLECTIONS',
    minPrice: 3000,
    maxPrice: 4999,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 5,
    title: '₹5,000+',
    subtitle: 'COLLECTIONS',
    minPrice: 5000,
    maxPrice: null,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
  }
];

function ShopByPrice() {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const handleCardClick = (item) => {
    let url = `/sarees?minPrice=${item.minPrice}`;
    if (item.maxPrice !== null) {
      url += `&maxPrice=${item.maxPrice}`;
    }
    navigate(url);
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.section}>
      {/* SVG Clip Path Definition for Scalloped Arch Frame */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <clipPath id="scallopedBadgeClip" clipPathUnits="objectBoundingBox">
            <path d="
              M 0.18 0.12 
              C 0.18 0.02, 0.82 0.02, 0.82 0.12 
              C 0.95 0.15, 0.98 0.28, 0.88 0.36 
              C 0.98 0.44, 0.98 0.58, 0.88 0.66 
              C 0.98 0.74, 0.95 0.87, 0.82 0.90 
              C 0.82 0.98, 0.18 0.98, 0.18 0.90 
              C 0.05 0.87, 0.02 0.74, 0.12 0.66 
              C 0.02 0.58, 0.02 0.44, 0.12 0.36 
              C 0.02 0.28, 0.05 0.15, 0.18 0.12 
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>SHOP BY PRICE</h2>
        <p className={styles.subtitleHeader}>Find Your Perfect Saree Within Budget</p>
        <div className={styles.titleDivider}>
          <span className={styles.line}></span>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        <button 
          className={`${styles.navBtn} ${styles.prevBtn}`} 
          onClick={() => scroll('left')}
          aria-label="Previous price ranges"
        >
          <FiChevronLeft />
        </button>

        <div className={styles.carousel} ref={carouselRef}>
          {PRICE_CATEGORIES.map((item) => (
            <div 
              key={item.id} 
              className={styles.cardContainer}
              onClick={() => handleCardClick(item)}
            >
              {/* 3D Scalloped Frame Badge */}
              <div className={styles.scallopedFrame}>
                {/* Saree Model Image */}
                <img 
                  src={item.image} 
                  alt={`Sarees ${item.title}`} 
                  className={styles.sareeImage}
                  loading="lazy"
                />

                {/* Bottom Rich Chocolate Gradient Badge & Typography */}
                <div className={styles.badgeFooter}>
                  <h3 className={styles.priceTitle}>{item.title}</h3>
                  <span className={styles.collectionText}>{item.subtitle}</span>
                  {/* Decorative Wreath Flourish */}
                  <div className={styles.flourishGraphic}>
                    <svg viewBox="0 0 120 16" className={styles.flourishSvg}>
                      <path d="M 15 8 Q 45 2 60 8 Q 75 14 105 8" stroke="#e6c896" strokeWidth="1.2" fill="none" />
                      <circle cx="60" cy="8" r="2.5" fill="#e6c896" />
                      <path d="M 40 8 Q 50 4 60 8 Q 70 12 80 8" stroke="#e6c896" strokeWidth="0.8" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          className={`${styles.navBtn} ${styles.nextBtn}`} 
          onClick={() => scroll('right')}
          aria-label="Next price ranges"
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}

export default ShopByPrice;
