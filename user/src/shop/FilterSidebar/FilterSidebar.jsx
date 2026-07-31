import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiRotateCcw, FiStar } from 'react-icons/fi';
import api from '../../services/api';
import styles from './FilterSidebar.module.css';

// Default Fallback Filter metadata
const DEFAULT_FILTER_DATA = {
  fabrics: ['Silk', 'Cotton', 'Linen', 'Organza', 'Georgette', 'Tissue', 'Banarasi', 'Kanchipuram'],
  occasions: ['Wedding', 'Reception', 'Party', 'Office', 'Daily Wear', 'Festive'],
  colors: [
    { name: 'Pink', hex: '#ffc0cb' },
    { name: 'Green', hex: '#2e7d32' },
    { name: 'Lavender', hex: '#e6e6fa' },
    { name: 'Peach', hex: '#ffdab9' },
    { name: 'Red', hex: '#d32f2f' },
    { name: 'Purple', hex: '#7b1fa2' },
    { name: 'Gold', hex: '#d4af37' },
    { name: 'Teal', hex: '#008080' }
  ],
  patterns: ['Solid', 'Brocade', 'Zari Woven', 'Printed']
};

function FilterSidebar({
  selectedFabrics,
  setSelectedFabrics,
  selectedOccasions,
  setSelectedOccasions,
  selectedColors,
  setSelectedColors,
  selectedPatterns,
  setSelectedPatterns,
  dynamicFilters = {},
  setDynamicFilters = () => {},
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  blouseFilter,
  setBlouseFilter,
  availabilityFilter,
  setAvailabilityFilter,
  onResetFilters
}) {
  const [filterData, setFilterData] = useState(DEFAULT_FILTER_DATA);
  const [openFilters, setOpenFilters] = useState({
    fabrics: true,
    occasions: true,
    colors: true,
    patterns: true,
    price: true,
    rating: false,
    blouse: false,
    availability: false
  });

  useEffect(() => {
    let isMounted = true;
    api.getMasterData()
      .then(res => {
        if (isMounted && res && res.masterData) {
          const liveData = { ...DEFAULT_FILTER_DATA, ...res.masterData };
          setFilterData(liveData);
        }
      })
      .catch(err => console.warn('[FilterSidebar] Master data load warning:', err.message));

    return () => { isMounted = false; };
  }, []);

  const toggleSection = (section) => {
    setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleToggleArray = (value, array, setArray) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* Sidebar Header */}
      <div className={styles.header}>
        <h4 className={styles.sidebarTitle}>Filters</h4>
        <button onClick={() => { onResetFilters(); setDynamicFilters({}); }} className={styles.resetBtn} title="Reset all filters">
          <FiRotateCcw className={styles.resetIcon} />
          Reset All
        </button>
      </div>

      {/* 1. Fabric Accordion */}
      {filterData.fabrics && filterData.fabrics.length > 0 && (
        <div className={styles.accordionSection}>
          <button className={styles.accordionHeader} onClick={() => toggleSection('fabrics')}>
            <span>Fabric</span>
            {openFilters.fabrics ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openFilters.fabrics && (
            <div className={styles.accordionBody}>
              {filterData.fabrics.map((item, i) => (
                <label key={i} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedFabrics.includes(item)}
                    onChange={() => handleToggleArray(item, selectedFabrics, setSelectedFabrics)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Occasion Accordion */}
      {filterData.occasions && filterData.occasions.length > 0 && (
        <div className={styles.accordionSection}>
          <button className={styles.accordionHeader} onClick={() => toggleSection('occasions')}>
            <span>Occasion</span>
            {openFilters.occasions ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openFilters.occasions && (
            <div className={styles.accordionBody}>
              {filterData.occasions.map((item, i) => (
                <label key={i} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedOccasions.includes(item)}
                    onChange={() => handleToggleArray(item, selectedOccasions, setSelectedOccasions)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Color Swatches Accordion */}
      {filterData.colors && filterData.colors.length > 0 && (
        <div className={styles.accordionSection}>
          <button className={styles.accordionHeader} onClick={() => toggleSection('colors')}>
            <span>Color</span>
            {openFilters.colors ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openFilters.colors && (
            <div className={styles.accordionBody}>
              <div className={styles.swatchGrid}>
                {filterData.colors.map((color, i) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={i}
                      onClick={() => handleToggleArray(color.name, selectedColors, setSelectedColors)}
                      className={`${styles.swatchBtn} ${isSelected ? styles.swatchSelected : ''}`}
                      style={{ '--swatch-color': color.hex }}
                      title={color.name}
                      aria-label={`Select color ${color.name}`}
                    >
                      <span className={styles.tooltip}>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Pattern Accordion */}
      {filterData.patterns && filterData.patterns.length > 0 && (
        <div className={styles.accordionSection}>
          <button className={styles.accordionHeader} onClick={() => toggleSection('patterns')}>
            <span>Pattern</span>
            {openFilters.patterns ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openFilters.patterns && (
            <div className={styles.accordionBody}>
              {filterData.patterns.map((item, i) => (
                <label key={i} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedPatterns.includes(item)}
                    onChange={() => handleToggleArray(item, selectedPatterns, setSelectedPatterns)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>{item}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Dynamic Custom Master Type Accordions */}
      {Object.keys(filterData || {}).map((key) => {
        const standardKeys = ['fabrics', 'occasions', 'colors', 'patterns'];
        if (standardKeys.includes(key.toLowerCase())) return null;

        const items = filterData[key];
        if (!Array.isArray(items) || items.length === 0) return null;

        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const isOpen = openFilters[key] ?? true;
        const currentSelected = dynamicFilters[key] || [];

        return (
          <div className={styles.accordionSection} key={key}>
            <button className={styles.accordionHeader} onClick={() => toggleSection(key)}>
              <span>{label}</span>
              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && (
              <div className={styles.accordionBody}>
                {items.map((item, i) => {
                  const itemName = typeof item === 'string' ? item : item.name;
                  const isChecked = currentSelected.includes(itemName);

                  return (
                    <label key={i} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const nextArr = isChecked
                            ? currentSelected.filter(x => x !== itemName)
                            : [...currentSelected, itemName];
                          setDynamicFilters(prev => ({ ...prev, [key]: nextArr }));
                        }}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxText}>{itemName}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* 5. Price Range Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('price')}>
          <span>Price Range</span>
          {openFilters.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.price && (
          <div className={styles.accordionBody}>
            <div className={styles.priceSliderWrapper}>
              <div className={styles.priceRow}>
                <span>Max Price:</span>
                <span className={styles.priceDisplay}>₹{priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="500"
                max="500000"
                step="1000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className={styles.sliderInput}
              />
              <div className={styles.priceLimits}>
                <span>₹500</span>
                <span>₹5,00,000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Rating Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('rating')}>
          <span>Rating</span>
          {openFilters.rating ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.rating && (
          <div className={styles.accordionBody}>
            {[4.5, 4.0, 3.5].map((ratingVal, i) => (
              <label key={i} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="rating-filter"
                  checked={minRating === ratingVal}
                  onChange={() => setMinRating(ratingVal)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>
                  {ratingVal} <FiStar className={styles.starIcon} /> & above
                </span>
              </label>
            ))}
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="rating-filter"
                checked={minRating === 0}
                onChange={() => setMinRating(0)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>All Ratings</span>
            </label>
          </div>
        )}
      </div>

      {/* 7. Blouse Included Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('blouse')}>
          <span>Blouse Included</span>
          {openFilters.blouse ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.blouse && (
          <div className={styles.accordionBody}>
            {[
              { label: 'All', value: 'all' },
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' }
            ].map((option, i) => (
              <label key={i} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="blouse-filter"
                  checked={blouseFilter === option.value}
                  onChange={() => setBlouseFilter(option.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 8. Availability Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('availability')}>
          <span>Availability</span>
          {openFilters.availability ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.availability && (
          <div className={styles.accordionBody}>
            {[
              { label: 'All Products', value: 'all' },
              { label: 'In Stock Only', value: 'inStock' },
              { label: 'Out of Stock Only', value: 'outOfStock' }
            ].map((option, i) => (
              <label key={i} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="availability-filter"
                  checked={availabilityFilter === option.value}
                  onChange={() => setAvailabilityFilter(option.value)}
                  className={styles.radioInput}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default FilterSidebar;
