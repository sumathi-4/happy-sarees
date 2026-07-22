import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import styles from './RelatedProducts.module.css';

function RelatedProducts({ products = [] }) {
  const scrollRef = useRef(null);

  if (!products.length) return null;

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Related Products</h3>
        <div className={styles.navArrows}>
          <button
            onClick={() => handleScroll('left')}
            className={styles.arrowBtn}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className={styles.arrowBtn}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className={styles.productSlider}>
        {products.map((item) => (
          <div key={item.id} style={{ flex: '0 0 260px', minWidth: '260px' }}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
