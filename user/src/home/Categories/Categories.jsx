import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../data/mockData';
import styles from './Categories.module.css';

function Categories() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Select Your Silhouette</span>
        <h2 className={styles.title}>Shop By Category</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} to={cat.path} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={cat.image} alt={cat.title} className={styles.image} />
              <div className={styles.editorialOverlay}>
                <span className={styles.magazineLabel}>HAPPY SAREES EDITORIAL</span>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{cat.title}</h3>
                  <span className={styles.productCount}>{cat.count}</span>
                  <span className={styles.shopNowLabel}>Shop Collection &rarr;</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;
