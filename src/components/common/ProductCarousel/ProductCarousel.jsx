import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductCarousel.module.css';

function ProductCarousel({ products = [], title, tag }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.headerRow}>
        <div>
          {tag && <span className={styles.tag}>{tag}</span>}
          {title && <h3 className={styles.title}>{title}</h3>}
        </div>

        <div className={styles.arrowGroup}>
          <button
            onClick={() => handleScroll('left')}
            className={styles.arrowBtn}
            aria-label="Previous Products"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className={styles.arrowBtn}
            aria-label="Next Products"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.sliderTrack} ref={scrollRef}>
        {products.map((product) => (
          <div key={product.id} className={styles.slideItem}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductCarousel;
