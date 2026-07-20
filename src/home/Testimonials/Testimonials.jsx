import React, { useState } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TESTIMONIALS } from '../../data/mockData';
import styles from './Testimonials.module.css';

function Testimonials() {
  const [index, setIndex] = useState(0);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Patron Reviews</span>
        <h2 className={styles.title}>Customer Reviews</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.carouselContainer}>
        {/* Left Arrow Navigation */}
        <button onClick={prevSlide} className={styles.arrowBtn} aria-label="Previous review">
          <FiChevronLeft />
        </button>

        {/* Testimonial Panel */}
        <div className={styles.slide}>
          <div className={styles.avatarWrapper}>
            <img src={TESTIMONIALS[index].avatar} alt={TESTIMONIALS[index].name} className={styles.avatar} />
            <div className={styles.ringAccent}></div>
          </div>
          <div className={styles.card}>
            <div className={styles.rating}>
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={i < TESTIMONIALS[index].rating ? styles.starFilled : styles.starEmpty} />
              ))}
            </div>
            <p className={styles.comment}>"{TESTIMONIALS[index].comment}"</p>
            <h3 className={styles.author}>{TESTIMONIALS[index].name}</h3>
            <span className={styles.verifiedTag}>Verified Buyer</span>
          </div>
        </div>

        {/* Right Arrow Navigation */}
        <button onClick={nextSlide} className={styles.arrowBtn} aria-label="Next review">
          <FiChevronRight />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className={styles.dots}>
        {TESTIMONIALS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)} 
            className={`${styles.dotBtn} ${i === index ? styles.activeDot : ''}`}
            aria-label={`Navigate to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Testimonials;
