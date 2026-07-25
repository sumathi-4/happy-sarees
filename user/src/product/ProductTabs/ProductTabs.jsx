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
                <p className={styles.narrativeText}>
                  {product.description || product.fullDescription || product.longDescription || 'No detailed description available for this product.'}
                </p>
              </div>
            )}

            {activeTab === 'washcare' && (
              <div className={styles.panelContent}>
                <p className={styles.narrativeText}>
                  {product.washCare || product.wash_care || 'Dry Clean Only'}
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className={styles.panelContent}>
                <p className={styles.narrativeText}>{product.shippingReturns || 'Dispatched within 24-48 business hours with free shipping across India.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Saree Details Summary Box */}
        <div className={styles.rightCol}>
          <div className={styles.specsCard}>
            <h4 className={styles.cardTitle}>SAREE DETAILS</h4>

            <div className={styles.cardTable}>
              {product.fabric && String(product.fabric).trim() !== '' && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Fabric</span>
                  <span className={styles.cardColon}>:</span>
                  <span className={styles.cardVal}>{product.fabric}</span>
                </div>
              )}
              {product.weave && String(product.weave).trim() !== '' && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Weave</span>
                  <span className={styles.cardColon}>:</span>
                  <span className={styles.cardVal}>{product.weave}</span>
                </div>
              )}
              {product.border && String(product.border).trim() !== '' && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Border</span>
                  <span className={styles.cardColon}>:</span>
                  <span className={styles.cardVal}>{product.border}</span>
                </div>
              )}
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Blouse</span>
                <span className={styles.cardColon}>:</span>
                <span className={styles.cardVal}>
                  {(product.blouseIncluded === true || product.blouse_included === true)
                    ? `Included${product.blouseSize ? ` (${product.blouseSize})` : ''}`
                    : 'Not Included'}
                </span>
              </div>

              {isSpecsExpanded && (
                <>
                  {product.pattern && String(product.pattern).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Pattern</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.pattern}</span>
                    </div>
                  )}
                  {product.color && String(product.color).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Color</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.color}</span>
                    </div>
                  )}
                  {product.width && String(product.width).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Width</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.width}</span>
                    </div>
                  )}
                  {(product.height || product.sareeLength) && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Height</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.height || product.sareeLength}</span>
                    </div>
                  )}
                  {product.weight && String(product.weight).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Weight</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.weight}</span>
                    </div>
                  )}
                  {product.occasion && String(product.occasion).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Occasion</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.occasion}</span>
                    </div>
                  )}
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Country of Origin</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{product.countryOfOrigin || 'India'}</span>
                  </div>
                  {product.sku && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>SKU</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.sku}</span>
                    </div>
                  )}
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
