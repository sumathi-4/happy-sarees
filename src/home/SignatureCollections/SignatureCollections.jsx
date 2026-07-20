import React from 'react';
import { Link } from 'react-router-dom';
import { SIGNATURE_COLLECTIONS } from '../../data/mockData';
import styles from './SignatureCollections.module.css';

function SignatureCollections() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Curated Lifestyle Looks</span>
        <h2 className={styles.title}>Signature Collections</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {SIGNATURE_COLLECTIONS.map((col) => (
          <div key={col.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img src={col.image} alt={col.title} className={styles.image} />
              <div className={styles.overlay}></div>
            </div>
            <div className={styles.cardBody}>
              <span className={styles.cardSubtitle}>{col.subtitle}</span>
              <h3 className={styles.cardTitle}>{col.title}</h3>
              <p className={styles.cardDesc}>{col.description}</p>
              <Link to={`/shop?collection=${encodeURIComponent(col.subtitle)}`} className={styles.exploreBtn} style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                {col.ctaText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SignatureCollections;
