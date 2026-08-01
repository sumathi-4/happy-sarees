import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { FiGrid, FiList, FiCheckCircle, FiRefreshCw, FiShield, FiTruck } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { SAMPLE_PRODUCT_DETAIL } from '../data/mockData';
import WishlistCard from '../wishlist/WishlistCard/WishlistCard';
import EmptyWishlist from '../wishlist/EmptyWishlist/EmptyWishlist';
import RecentlyViewed from '../product/RecentlyViewed/RecentlyViewed';
import styles from './Wishlist.module.css';

function Wishlist({ isProfileView = false }) {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  const wishlistItems = wishlist || [];

  const handleRemove = (id) => {
    removeFromWishlist(id);
  };

  const handleAddToCart = (product) => {
    if (product) {
      addToCart(product);
    }
  };

  // Sort logic
  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>Wishlist</span>
        </nav>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              My Wishlist <FaHeart className={styles.heartTitleIcon} />
            </h1>
            <span className={styles.counterText}>
              <strong className={styles.counterNum}>{wishlistItems.length}</strong> Saved Sarees
            </span>
          </div>

          {/* Right Toolbar */}
          {wishlistItems.length > 0 && (
            <div className={styles.headerRight}>
              <div className={styles.sortWrapper}>
                <label htmlFor="wishlist-sort" className={styles.sortLabel}>Sort by:</label>
                <select
                  id="wishlist-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

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
          )}
        </div>

        {/* Main Content (Cards Grid OR Empty State) */}
        {sortedItems.length > 0 ? (
          <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
            {sortedItems.map((item) => (
              <WishlistCard
                key={item.id}
                product={item}
                onRemove={handleRemove}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <EmptyWishlist />
        )}

        {/* Recently Viewed Products Carousel — Full width on standalone Wishlist page */}
        {!isProfileView && <RecentlyViewed />}

        {/* Trust Badges */}
        <div className={styles.trustBadgesSection}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <FiCheckCircle className={styles.trustIcon} />
              <div>
                <h5 className={styles.trustTitle}>100% Quality Assured</h5>
                <p className={styles.trustSubtitle}>Premium quality products</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <FiRefreshCw className={styles.trustIcon} />
              <div>
                <h5 className={styles.trustTitle}>Easy Returns</h5>
                <p className={styles.trustSubtitle}>Hassle-free 7-day returns</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <FiShield className={styles.trustIcon} />
              <div>
                <h5 className={styles.trustTitle}>Secure Payments</h5>
                <p className={styles.trustSubtitle}>100% safe & encrypted</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <FiTruck className={styles.trustIcon} />
              <div>
                <h5 className={styles.trustTitle}>Free Shipping</h5>
                <p className={styles.trustSubtitle}>On orders above ₹999</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
