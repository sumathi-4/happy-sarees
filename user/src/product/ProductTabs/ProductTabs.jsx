import React, { useState, useEffect } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ProductTabs.module.css';

function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);
  const [specTypes, setSpecTypes] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.getSpecTypes()
      .then(res => {
        if (isMounted && res && Array.isArray(res.types)) {
          setSpecTypes(res.types.filter(t => t.show_in_specifications !== false));
        }
      })
      .catch(err => console.warn('[ProductTabs] Spec types load warning:', err.message));
    return () => { isMounted = false; };
  }, []);

  if (!product) return null;

  // Helper to format key labels
  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Check if a master type is allowed in specifications
  const isTypeAllowed = (slug) => {
    if (!specTypes) return true; // default true if not loaded
    const match = specTypes.find(t => t.slug === slug || t.slug === slug + 's' || t.slug + 's' === slug);
    return match ? match.show_in_specifications !== false : true;
  };

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
              {isTypeAllowed('fabrics') && product.fabric && String(product.fabric).trim() !== '' && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Fabric</span>
                  <span className={styles.cardColon}>:</span>
                  <span className={styles.cardVal}>{product.fabric}</span>
                </div>
              )}
              {isTypeAllowed('weaves') && product.weave && String(product.weave).trim() !== '' && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Weave</span>
                  <span className={styles.cardColon}>:</span>
                  <span className={styles.cardVal}>{product.weave}</span>
                </div>
              )}
              {isTypeAllowed('borders') && product.border && String(product.border).trim() !== '' && (
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
                  {isTypeAllowed('patterns') && product.pattern && String(product.pattern).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Pattern</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.pattern}</span>
                    </div>
                  )}
                  {isTypeAllowed('colors') && product.color && String(product.color).trim() !== '' && (
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
                  {isTypeAllowed('occasions') && product.occasion && String(product.occasion).trim() !== '' && (
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Occasion</span>
                      <span className={styles.cardColon}>:</span>
                      <span className={styles.cardVal}>{product.occasion}</span>
                    </div>
                  )}

                  {/* Render any Custom Master Types dynamically */}
                  {Object.entries(product.customMasterData || {}).map(([key, val]) => {
                    if (!val || String(val).trim() === '') return null;
                    const standardKeys = ['fabric','weave','border','pattern','color','occasion','brand','collection','fabrics','weaves','borders','patterns','colors','occasions','brands','collections'];
                    if (standardKeys.includes(key.toLowerCase())) return null;
                    if (!isTypeAllowed(key)) return null;

                    return (
                      <div className={styles.cardRow} key={key}>
                        <span className={styles.cardLabel}>{formatLabel(key)}</span>
                        <span className={styles.cardColon}>:</span>
                        <span className={styles.cardVal}>{val}</span>
                      </div>
                    );
                  })}
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
