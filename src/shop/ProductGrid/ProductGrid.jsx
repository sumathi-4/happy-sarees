import React from 'react';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../../components/common/ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

function ProductGrid({
  products,
  isLoading,
  viewMode,
  onQuickView,
  onToggleWishlist,
  onAddToCart,
  onResetFilters,
  wishlistedIds = []
}) {
  // Pulse skeleton loader
  const renderSkeletons = () => {
    return (
      <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
            <div className={`${styles.imageWrapper} ${styles.skeletonImage}`} />
            <div className={styles.metaWrapper}>
              <div className={`${styles.skeletonText} ${styles.skeletonTag}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonTitle}`} />
              <div className={`${styles.skeletonText} ${styles.skeletonPrice}`} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return renderSkeletons();
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrapper}>
          <FiSearch className={styles.emptyIcon} />
        </div>
        <h3 className={styles.emptyTitle}>No Sarees Found</h3>
        <p className={styles.emptyText}>
          We couldn't find any sarees matching your selected filter combinations. Try resetting the filters to explore our full collection.
        </p>
        <button onClick={onResetFilters} className={styles.resetBtn}>
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className={styles.gridWrapper}>
      <div className={viewMode === 'grid' ? styles.grid : styles.listView}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
