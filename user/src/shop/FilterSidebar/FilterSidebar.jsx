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
    { name: 'Green', hex: 'var(--success-color)' },
    { name: 'Lavender', hex: '#e6e6fa' },
    { name: 'Peach', hex: '#ffdab9' },
    { name: 'Red', hex: 'var(--error-color)' },
    { name: 'Purple', hex: '#7b1fa2' },
    { name: 'Gold', hex: '#d4af37' },
    { name: 'Teal', hex: '#008080' }
  ],
  patterns: ['Solid', 'Brocade', 'Zari Woven', 'Printed']
};

const DEFAULT_MASTER_TYPES = [
  { id: 1, name: 'Fabrics', slug: 'fabrics', show_in_filters: true },
  { id: 2, name: 'Occasions', slug: 'occasions', show_in_filters: true },
  { id: 3, name: 'Colors', slug: 'colors', show_in_filters: true },
  { id: 4, name: 'Patterns', slug: 'patterns', show_in_filters: true }
];

function FilterSidebar({
  selectedFabrics,
  setSelectedFabrics,
  selectedOccasions,
  setSelectedOccasions,
  selectedColors,
  setSelectedColors,
  selectedPatterns,
  setSelectedPatterns,
  newArrivalsOnly = false,
  setNewArrivalsOnly = () => {},
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
  const [masterTypes, setMasterTypes] = useState(DEFAULT_MASTER_TYPES);
  const [filterData, setFilterData] = useState(DEFAULT_FILTER_DATA);
  const [openFilters, setOpenFilters] = useState({
    newArrivals: true,
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
    Promise.all([
      api.getSpecTypes(),
      api.getMasterData()
    ])
      .then(([specRes, masterRes]) => {
        if (!isMounted) return;
        if (specRes && specRes.success && Array.isArray(specRes.types)) {
          const activeFilters = specRes.types.filter(t => t.show_in_filters !== false);
          setMasterTypes(activeFilters);
        }
        if (masterRes && masterRes.success && masterRes.masterData && Object.keys(masterRes.masterData).length > 0) {
          setFilterData(masterRes.masterData);
        }
      })
      .catch(err => console.warn('[FilterSidebar] Dynamic filter load error:', err.message));

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

      {/* Dynamic Master Data Filter Accordions */}
      {masterTypes.map((type) => {
        const typeSlug = (type.slug || type.name || '').toLowerCase().trim();
        
        // Find matching items from filterData, checking singular/plural and case-insensitivity
        const items = filterData[typeSlug] || 
                      filterData[typeSlug + 's'] || 
                      filterData[typeSlug.replace(/s$/, '')] || 
                      [];

        if (!Array.isArray(items) || items.length === 0) return null;

        const isOpen = openFilters[typeSlug] ?? true;
        const isColor = typeSlug.includes('color');
        const isFabric = typeSlug === 'fabrics' || typeSlug === 'fabric';
        const isOccasion = typeSlug === 'occasions' || typeSlug === 'occasion';
        const isPattern = typeSlug === 'patterns' || typeSlug === 'pattern';

        return (
          <div className={styles.accordionSection} key={type.id || typeSlug}>
            <button className={styles.accordionHeader} onClick={() => toggleSection(typeSlug)}>
              <span>{type.name}</span>
              {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && (
              <div className={styles.accordionBody}>
                {isColor ? (
                  <div className={styles.swatchGrid}>
                    {items.map((color, i) => {
                      const colorName = typeof color === 'string' ? color : color.name;
                      const colorHex = typeof color === 'string' ? '#e0e0e0' : (color.hex || '#e0e0e0');
                      const isSelected = selectedColors.includes(colorName);
                      return (
                        <button
                          key={i}
                          onClick={() => handleToggleArray(colorName, selectedColors, setSelectedColors)}
                          className={`${styles.swatchBtn} ${isSelected ? styles.swatchSelected : ''}`}
                          style={{ '--swatch-color': colorHex }}
                          title={colorName}
                          aria-label={`Select color ${colorName}`}
                        >
                          <span className={styles.tooltip}>{colorName}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    {items.map((item, i) => {
                      const itemName = typeof item === 'string' ? item : item.name;
                      
                      let isChecked = false;
                      let onChangeHandler = () => {};

                      if (isFabric) {
                        isChecked = selectedFabrics.includes(itemName);
                        onChangeHandler = () => handleToggleArray(itemName, selectedFabrics, setSelectedFabrics);
                      } else if (isOccasion) {
                        isChecked = selectedOccasions.includes(itemName);
                        onChangeHandler = () => handleToggleArray(itemName, selectedOccasions, setSelectedOccasions);
                      } else if (isPattern) {
                        isChecked = selectedPatterns.includes(itemName);
                        onChangeHandler = () => handleToggleArray(itemName, selectedPatterns, setSelectedPatterns);
                      } else {
                        const currentSelected = dynamicFilters[typeSlug] || [];
                        isChecked = currentSelected.includes(itemName);
                        onChangeHandler = () => {
                          const nextArr = isChecked
                            ? currentSelected.filter(x => x !== itemName)
                            : [...currentSelected, itemName];
                          setDynamicFilters(prev => ({ ...prev, [typeSlug]: nextArr }));
                        };
                      }

                      return (
                        <label key={i} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={onChangeHandler}
                            className={styles.checkboxInput}
                          />
                          <span className={styles.checkboxText}>{itemName}</span>
                        </label>
                      );
                    })}
                  </>
                )}
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

      {/* 9. Dedicated New Arrivals Filter */}
      <div className={styles.accordionSection}>
        <button className={styles.accordionHeader} onClick={() => toggleSection('newArrivals')}>
          <span>New Arrivals</span>
          {openFilters.newArrivals ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {openFilters.newArrivals && (
          <div className={styles.accordionBody}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newArrivalsOnly}
                onChange={(e) => setNewArrivalsOnly(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxText}>New Arrivals Only</span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
}

export default FilterSidebar;
