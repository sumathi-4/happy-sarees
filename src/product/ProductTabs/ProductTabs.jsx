import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import styles from './ProductTabs.module.css';

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);

  if (!product) return null;

  return (
    <div className={styles.productTabsContainer}>
      <div className={styles.layoutGrid}>
        {/* Left Column: Tab Headers & Content */}
        <div className={styles.leftCol}>
          {/* Tab Headers */}
          <div className={styles.tabHeaders}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'description' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'specifications' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'washcare' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('washcare')}
            >
              Wash Care
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'shipping' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
          </div>

          {/* Active Tab Content Panel */}
          <div className={styles.tabPanel}>
            {activeTab === 'description' && (
              <div className={styles.panelContent}>
                <p className={styles.narrativeText}>{product.description}</p>
                <p className={styles.narrativeText}>
                  Designed for women who appreciate rich heritage textiles, this saree combines traditional weaving techniques with modern color palettes. Pair it with gold temple jewelry and a sleek hair bun to complete your royal ethnic look.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className={styles.panelContent}>
                <div className={styles.specListGrid}>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Weave Type</span>
                    <span className={styles.specBoxVal}>{product.weave || 'Traditional Handloom'}</span>
                  </div>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Border Work</span>
                    <span className={styles.specBoxVal}>{product.border || 'Zari Woven Border'}</span>
                  </div>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Pallu Design</span>
                    <span className={styles.specBoxVal}>{product.pallu || 'Grand Zari Pallu'}</span>
                  </div>
                  <div className={styles.specBox}>
                    <span className={styles.specBoxLabel}>Weight</span>
                    <span className={styles.specBoxVal}>{product.weight || '650 Grams'}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'washcare' && (
              <div className={styles.panelContent}>
                <ul className={styles.careList}>
                  <li>Dry Clean Only is recommended for long-lasting vibrancy.</li>
                  <li>Store in a breathable cotton cloth bag; avoid plastic covers.</li>
                  <li>Do not spray perfume directly on zari work.</li>
                  <li>Iron on low heat with a protective cotton cloth over the saree.</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className={styles.panelContent}>
                <p className={styles.narrativeText}>{product.shippingReturns}</p>
                <ul className={styles.careList}>
                  <li>Dispatched within 24-48 business hours.</li>
                  <li>Free Express Delivery across 25,000+ PIN codes in India.</li>
                  <li>Hassle-free 7-day Return and Exchange policy.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Specifications Summary Box */}
        <div className={styles.rightCol}>
          <div className={styles.specsCard}>
            <h4 className={styles.cardTitle}>Specifications</h4>

            <div className={styles.cardTable}>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Fabric</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>{product.fabric}</span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Weave</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>{product.weave || 'Handloom'}</span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Border</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>{product.border || 'Zari Woven'}</span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Pallu</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>{product.pallu || 'Traditional Zari Pallu'}</span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Blouse</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>{product.blouseType || 'Running Blouse'}</span>
              </div>

              {isSpecsExpanded && (
                <>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Pattern</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.pattern}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Color</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.color}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Width</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.width}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Height</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.height}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Weight</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.weight || '650 Grams'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Occasion</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.occasion}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Country of Origin</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.countryOfOrigin || 'India'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>SKU</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.sku}</span>
                  </div>
                </>
              )}
            </div>

            {/* View More / View Less Toggle */}
            <button
              onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
              className={styles.toggleSpecsBtn}
            >
              {isSpecsExpanded ? 'View Less' : 'View More'}
              {isSpecsExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductTabs;
