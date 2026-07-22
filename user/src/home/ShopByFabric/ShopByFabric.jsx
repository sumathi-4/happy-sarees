import React from 'react';
import { Link } from 'react-router-dom';
import { FABRICS } from '../../data/mockData';
import styles from './ShopByFabric.module.css';

function ShopByFabric() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Premium Textures & Swatches</span>
        <h2 className={styles.title}>Shop By Fabric</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {FABRICS.map((fabric) => (
          <Link key={fabric.id} to={fabric.path} className={styles.card}>
            <div className={styles.imageCircle}>
              <img src={fabric.image} alt={fabric.name} className={styles.image} />
            </div>
            <h3 className={styles.name}>{fabric.name}</h3>
            <span className={styles.viewLink}>Explore &rarr;</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ShopByFabric;
