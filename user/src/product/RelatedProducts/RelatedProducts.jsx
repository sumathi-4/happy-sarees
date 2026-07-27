import React, { useRef, useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import styles from './RelatedProducts.module.css';

function RelatedProducts({ products: passedProducts = [] }) {
  const scrollRef = useRef(null);
  const [items, setItems] = useState(passedProducts);

  useEffect(() => {
    if (passedProducts && passedProducts.length > 0) {
      setItems(passedProducts);
    } else {
      let isMounted = true;
      api.getProducts()
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.products)) {
            setItems(data.products.slice(0, 8));
          }
        })
        .catch(() => {});
      return () => { isMounted = false; };
    }
  }, [passedProducts]);

  if (!items.length) return null;

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
        {items.map((item) => (
          <div key={item.id} style={{ flex: '0 0 260px', minWidth: '260px' }}>
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
