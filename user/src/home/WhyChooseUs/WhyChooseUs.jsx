import React from 'react';
import { FiAward, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { WHY_CHOOSE_US } from '../../data/mockData';
import styles from './WhyChooseUs.module.css';

const ICON_MAP = {
  1: <FiAward />,
  2: <FiShield />,
  3: <FiRefreshCw />,
  4: <FiTruck />
};

function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.tagline}>Premium Craftsmanship Guarantees</span>
          <h2 className={styles.title}>Why Happy Sarees</h2>
          <div className={styles.divider}>
            <span className={styles.dot}></span>
          </div>
        </div>

        <div className={styles.grid}>
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.iconCircle}>
                {ICON_MAP[item.id]}
              </div>
              <h3 className={item.id === 1 ? styles.qualityText : styles.cardTitle}>{item.title}</h3>
              <span className={styles.cardSubtitle}>{item.subtitle}</span>
              <p className={styles.cardDesc}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
