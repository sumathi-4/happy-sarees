import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../data/mockData';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import styles from './NewArrivals.module.css';

function NewArrivals() {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.getNewArrivals()
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.products)) {
          setNewProducts(data.products);
        }
      })
      .catch((err) => {
        console.warn('[NewArrivals] Live fetch warning:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Freshly Loomed Masterpieces</span>
        <h2 className={styles.title}>New Arrivals</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {newProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default NewArrivals;
