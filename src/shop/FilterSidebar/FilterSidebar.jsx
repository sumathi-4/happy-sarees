import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiRotateCcw, FiStar } from 'react-icons/fi';
import styles from './FilterSidebar.module.css';

// Filter metadata
const FILTER_DATA = {
  collections: ['Wedding Collection', 'Bridal Collection', 'Festival Collection', 'Premium Collection', 'Celebrity Picks', 'Trending Collection'],
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
  selectedCollections,
  setSelectedCollections,
  selectedFabrics,
  setSelectedFabrics,
  selectedOccasions,
  setSelectedOccasions,
  selectedColors,
  setSelectedColors,
  selectedPatterns,
  setSelectedPatterns,
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
  const [openFilters, setOpenFilters] = useState({
    collections: true,
    fabrics: true,
    occasions: true,
    colors: true,
    patterns: true,
    price: true,
    rating: false,
    blouse: false,
    availability: false
  });

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
        <button onClick={onResetFilters} className={styles.resetBtn} title="Reset all filters">
          <FiRotateCcw className={styles.resetIcon} />
          Reset All
        </button>
      </div>

      {/* 1. Collections Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('collections')}>
          <span>Collections</span>
          {openFilters.collections ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.collections && (
          <div className={styles.accordionBody}>
            {FILTER_DATA.collections.map((item, i) => (
              <label key={i} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(item)}
                  onChange={() => handleToggleArray(item, selectedCollections, setSelectedCollections)}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxText}>{item}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2. Fabric Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('fabrics')}>
          <span>Fabric</span>
          {openFilters.fabrics ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.fabrics && (
          <div className={styles.accordionBody}>
            {FILTER_DATA.fabrics.map((item, i) => (
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

      {/* 3. Occasion Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('occasions')}>
          <span>Occasion</span>
          {openFilters.occasions ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.occasions && (
          <div className={styles.accordionBody}>
            {FILTER_DATA.occasions.map((item, i) => (
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

      {/* 4. Color Swatches Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('colors')}>
          <span>Color</span>
          {openFilters.colors ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.colors && (
          <div className={styles.accordionBody}>
            <div className={styles.swatchGrid}>
              {FILTER_DATA.colors.map((color, i) => {
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

      {/* 5. Pattern Accordion */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('patterns')}>
          <span>Pattern</span>
          {openFilters.patterns ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.patterns && (
          <div className={styles.accordionBody}>
            {FILTER_DATA.patterns.map((item, i) => (
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

      {/* 6. Price Range Accordion */}
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
                min="1000"
                max="10000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className={styles.sliderInput}
              />
              <div className={styles.priceLimits}>
                <span>₹1,000</span>
                <span>₹10,000</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Rating Accordion */}
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

      {/* 8. Blouse Included Accordion */}
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

      {/* 9. Availability Accordion */}
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
