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
        {/* Section Header centered at top */}
        <div className={styles.sectionHeader}>
          <span className={styles.tagline}>Premium Craftsmanship Guarantees</span>
          <h2 className={styles.title}>Why Happy Sarees</h2>
          <div className={styles.divider}>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* 2-Column Split: 2x2 Cards Grid on Left, Full Height Image on Right */}
        <div className={styles.layoutWrapper}>
          {/* Left Column: 2x2 Cards Grid */}
          <div className={styles.leftColumn}>
            <div className={styles.cardsGrid}>
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

          {/* Right Column: Frameless Cutout Models Image matching exact height of cards grid */}
          <div className={styles.rightColumn}>
            <div className={styles.imageWrapper}>
              <img 
                src="/images/why_choose_us_models.png?v=2" 
                alt="Happy Sarees Premium Collection" 
                className={styles.modelsImage} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
