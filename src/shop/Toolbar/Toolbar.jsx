import React from 'react';
import { FiGrid, FiList, FiSearch } from 'react-icons/fi';
import styles from './Toolbar.module.css';

function Toolbar({
  productCount,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.container}>
        {/* Left Side: Product Count */}
        <div className={styles.leftCol}>
          <span className={styles.countText}>
            Showing <strong className={styles.countHighlight}>{productCount}</strong> premium sarees
          </span>
        </div>

        {/* Right Side: Search, Sort, View Toggle */}
        <div className={styles.rightCol}>
          {/* Inner Search Box */}
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search in shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Sort Dropdown */}
          <div className={styles.sortWrapper}>
            <label htmlFor="shop-sort" className={styles.sortLabel}>Sort By</label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

          {/* Grid/List Toggle */}
          <div className={styles.toggleWrapper}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.activeToggle : ''}`}
              title="List View"
              aria-label="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;
