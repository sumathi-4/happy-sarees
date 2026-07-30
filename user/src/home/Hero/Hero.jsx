import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './Hero.module.css';

import banner1 from '../../assets/hero_banners/hero_banner_1.jpg';
import banner2 from '../../assets/hero_banners/hero_banner_2.jpg';
import banner3 from '../../assets/hero_banners/hero_banner_3.jpg';
import banner4 from '../../assets/hero_banners/hero_banner_4.jpg';

const HERO_SLIDES = [
  {
    id: 1,
    image: banner1,
    alt: 'New Arrivals Banner',
    tag: 'NEW ARRIVALS',
    title: 'Fresh Elegance',
    description: 'Discover our newest saree collection crafted for every celebration.',
    targetUrl: '/sarees?collection=New%20Arrivals'
  },
  {
    id: 2,
    image: banner2,
    alt: 'Wedding Collection Banner',
    tag: 'WEDDING COLLECTION',
    title: 'Celebrate Forever',
    description: 'Luxury wedding sarees designed for unforgettable moments.',
    targetUrl: '/shop?occasion=wedding'
  },
  {
    id: 3,
    image: banner3,
    alt: 'Authentic Silk Sarees Banner',
    tag: 'AUTHENTIC SILK',
    title: 'Timeless Heritage',
    description: 'Experience handcrafted silk sarees with traditional elegance.',
    targetUrl: '/sarees'
  },
  {
    id: 4,
    image: banner4,
    alt: 'The Grand Saree Sale Banner',
    tag: null,
    title: null,
    description: null,
    targetUrl: '/sale'
  }
];

function Hero() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Auto Slide every 5 seconds (Pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      // Swipe Left -> Next Slide
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (distance < -50) {
      // Swipe Right -> Prev Slide
      setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section 
      className={styles.heroSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Luxury Background Ambient Effects */}
      <div className={styles.luxuryEffectsContainer}>
        <div className={styles.movingClouds}></div>
        <div className={styles.radialLightGlow}></div>
        <div className={styles.sparkleParticles}></div>
      </div>

      {/* Banner Slides */}
      <div className={styles.slidesWrapper}>
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          const isBanner4 = slide.id === 4;
          const hasTextContent = slide.title || slide.tag || slide.description;

          return (
            <div 
              key={slide.id} 
              className={`${styles.slide} ${isActive ? styles.activeSlide : ''} ${isBanner4 ? styles.clickableSlide : ''}`}
              onClick={() => isBanner4 && navigate(slide.targetUrl)}
            >
              {/* Clean Banner Image */}
              <div className={styles.imageContainer}>
                <img 
                  src={slide.image} 
                  alt={slide.alt} 
                  className={styles.bannerImage}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>

              {/* Render Text Block & Button for Banners 1-3 ONLY. Banner 4 has no button and is 100% clickable */}
              {!isBanner4 && (
                <div className={styles.contentContainer}>
                  {hasTextContent && (
                    <div className={styles.textGroup}>
                      {slide.tag && <span className={styles.smallTag}>{slide.tag}</span>}
                      {slide.title && <h2 className={styles.heading}>{slide.title}</h2>}
                      {slide.description && <p className={styles.description}>{slide.description}</p>}
                    </div>
                  )}

                  <div className={styles.buttonWrapper}>
                    <button 
                      className={styles.shopNowBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(slide.targetUrl);
                      }}
                      aria-label="Shop Now"
                    >
                      <span className={styles.btnText}>Shop Now</span>
                      <span className={styles.btnShine}></span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Previous & Next Navigation Arrows */}
      <button 
        className={`${styles.navArrow} ${styles.prevArrow}`}
        onClick={(e) => {
          e.stopPropagation();
          setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
        }}
        aria-label="Previous Banner"
      >
        <FiChevronLeft />
      </button>

      <button 
        className={`${styles.navArrow} ${styles.nextArrow}`}
        onClick={(e) => {
          e.stopPropagation();
          setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }}
        aria-label="Next Banner"
      >
        <FiChevronRight />
      </button>

      {/* Pagination Dots */}
      <div className={styles.paginationDots}>
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(index);
            }}
            aria-label={`Go to Slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  );
}

export default Hero;
