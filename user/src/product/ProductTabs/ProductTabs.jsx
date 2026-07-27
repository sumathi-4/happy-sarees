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
          setSpecTypes(res.types);
        }
      })
      .catch(err => console.warn('[ProductTabs] Spec types load warning:', err.message));
    return () => { isMounted = false; };
  }, []);

  if (!product) return null;

  // Helper to format key labels
  const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Check if a master type is allowed in specifications (Display in Saree Details checkbox checked in Admin)
  const isTypeAllowed = (keyOrSlug) => {
    if (!specTypes) return true;
    const clean = String(keyOrSlug).toLowerCase().trim().replace(/[_\s-]+/g, '');
    const match = specTypes.find(t => {
      const tSlug = String(t.slug || t.name).toLowerCase().trim().replace(/[_\s-]+/g, '');
      return tSlug === clean || tSlug === clean + 's' || tSlug + 's' === clean;
    });
    return match ? (match.show_in_specifications !== false) : false;
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
              {(() => {
                const allRows = [];

                // 1. Process Master Data Types (using live DB specTypes from /api/cms/spec-types)
                if (Array.isArray(specTypes)) {
                  specTypes.forEach(t => {
                    // RULE: Only display if "Show in Saree Details" (show_in_specifications / showInSpecs) is enabled in Neon DB
                    if (t.show_in_specifications === false || t.showInSpecs === false) return;

                    const label = t.name;
                    const slug = (t.slug || t.name || '').toLowerCase().trim();
                    const slugUnderscore = slug.replace(/-/g, '_');
                    const singularSlug = slug.endsWith('s') ? slug.slice(0, -1) : slug;
                    const singularUnderscore = singularSlug.replace(/-/g, '_');

                    // Check exact ID-based match from product.specifications array first
                    let specMatch = Array.isArray(product.specifications) 
                      ? product.specifications.find(s => Number(s.master_type_id) === Number(t.id))
                      : null;

                    // Retrieve selected value on product
                    let val = (specMatch && specMatch.value) ? specMatch.value : (
                      product[t.id] ??
                      product[singularSlug] ??
                      product[singularUnderscore] ??
                      product[slug] ??
                      product[slugUnderscore] ??
                      product[label] ??
                      product.customMasterData?.[t.id] ??
                      product.customMasterData?.[singularSlug] ??
                      product.customMasterData?.[singularUnderscore] ??
                      product.customMasterData?.[slug] ??
                      product.customMasterData?.[slugUnderscore] ??
                      product.customMasterData?.[label] ??
                      product.custom_master_data?.[t.id] ??
                      product.custom_master_data?.[singularSlug] ??
                      product.custom_master_data?.[singularUnderscore] ??
                      product.custom_master_data?.[slug] ??
                      product.custom_master_data?.[slugUnderscore] ??
                      product.custom_master_data?.[label]
                    );

                    if (val !== null && val !== undefined && typeof val !== 'function' && typeof val !== 'object') {
                      const valStr = String(val).trim();
                      if (valStr && valStr !== 'null' && valStr !== 'undefined' && valStr !== '[object Object]') {
                        allRows.push({ label, value: valStr, key: slug });
                      }
                    }
                  });
                }

                // 2. Process Product Specification Fields (Blouse, Width, Height, Weight, Country of Origin, SKU)
                
                // Blouse
                if (product.blouseIncluded !== undefined || product.blouse_included !== undefined) {
                  const isIncluded = product.blouseIncluded === true || product.blouse_included === true;
                  const blouseText = isIncluded
                    ? `Included${(product.blouseSize || product.blouse_size) ? ` (${product.blouseSize || product.blouse_size})` : ''}`
                    : 'Not Included';
                  allRows.push({ label: 'Blouse', value: blouseText, key: 'blouse' });
                }

                // Width
                const widthVal = product.width || product.sareeWidth || product.saree_width;
                if (widthVal && String(widthVal).trim()) {
                  allRows.push({ label: 'Width', value: String(widthVal).trim(), key: 'width' });
                }

                // Height / Saree Length
                const heightVal = product.height || product.sareeLength || product.saree_length;
                if (heightVal && String(heightVal).trim()) {
                  allRows.push({ label: 'Height', value: String(heightVal).trim(), key: 'height' });
                }

                // Weight
                const weightVal = product.weight;
                if (weightVal && String(weightVal).trim()) {
                  allRows.push({ label: 'Weight', value: String(weightVal).trim(), key: 'weight' });
                }

                // Country of Origin
                const countryVal = product.countryOfOrigin || product.country_of_origin || 'India';
                if (countryVal && String(countryVal).trim()) {
                  allRows.push({ label: 'Country of Origin', value: String(countryVal).trim(), key: 'country_of_origin' });
                }

                // SKU
                if (product.sku && String(product.sku).trim()) {
                  allRows.push({ label: 'SKU', value: String(product.sku).trim(), key: 'sku' });
                }

                // Determine visible rows based on View More / View Less toggle
                const visibleRows = isSpecsExpanded ? allRows : allRows.slice(0, 4);

                return visibleRows.map((row, idx) => (
                  <div className={styles.cardRow} key={row.key || idx}>
                    <span className={styles.cardLabel}>{row.label}</span>
                    <span className={styles.cardColon}>:</span>
                    <span className={styles.cardVal}>{row.value}</span>
                  </div>
                ));
              })()}
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
