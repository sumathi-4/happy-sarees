import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';
import api from '../services/api';
import Breadcrumb from '../shop/Breadcrumb/Breadcrumb';
import Toolbar from '../shop/Toolbar/Toolbar';
import FilterSidebar from '../shop/FilterSidebar/FilterSidebar';
import ProductGrid from '../shop/ProductGrid/ProductGrid';
import QuickViewModal from '../shop/QuickViewModal/QuickViewModal';
import { useWishlist } from '../context/WishlistContext';
import styles from './Shop.module.css';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, toggleWishlist } = useWishlist();
  const wishlistedIds = wishlist.map(item => Number(item.id || item.productId));

  // Products state (populated live from Neon PostgreSQL DB)
  const [productsList, setProductsList] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedFabrics, setSelectedFabrics] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPatterns, setSelectedPatterns] = useState([]);
  const [priceRange, setPriceRange] = useState(25000);
  const [minRating, setMinRating] = useState(0);
  const [blouseFilter, setBlouseFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Sorting & Layout States
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  
  // Loading & Load More States
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Quick View Product State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  // Fetch products from Neon PostgreSQL API on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api.getProducts()
      .then((data) => {
        if (isMounted && data.success) {
          setProductsList(data.products || []);
        }
      })
      .catch((err) => {
        console.warn('[Shop] Live products fetch warning:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Sync with Search Parameters (e.g. from header mega menu clicks)
  useEffect(() => {
    const fabric = searchParams.get('fabric');
    if (fabric) {
      const capFabric = fabric.charAt(0).toUpperCase() + fabric.slice(1);
      setSelectedFabrics([capFabric]);
    } else {
      setSelectedFabrics([]);
    }

    const occasion = searchParams.get('occasion');
    if (occasion) {
      const capOccasion = occasion.charAt(0).toUpperCase() + occasion.slice(1);
      setSelectedOccasions([capOccasion]);
    } else {
      setSelectedOccasions([]);
    }
    
    const collection = searchParams.get('collection');
    if (collection) {
      setSelectedCollections([collection]);
    } else {
      setSelectedCollections([]);
    }
  }, [searchParams]);

  const [dynamicFilters, setDynamicFilters] = useState({});

  // Reset Filters handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCollections([]);
    setSelectedFabrics([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setSelectedPatterns([]);
    setDynamicFilters({});
    setPriceRange(25000);
    setMinRating(0);
    setBlouseFilter('all');
    setAvailabilityFilter('all');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleAddToCart = (product) => {
    alert(`"${product.name}" added to cart successfully!`);
  };

  // --------------------------------------------------
  // CLIENT FILTER LOGIC
  // --------------------------------------------------
  let filteredProducts = [...productsList];

  // 1. Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p =>
        p.name.toLowerCase().includes(query) ||
        (p.fabric && p.fabric.toLowerCase().includes(query))
    );
  }

  // 2. Collection filter
  if (selectedCollections.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedCollections.includes(p.collection));
  }

  // 3. Fabric filter
  if (selectedFabrics.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedFabrics.includes(p.fabric));
  }

  // 4. Occasion filter
  if (selectedOccasions.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedOccasions.includes(p.occasion));
  }

  // 5. Color filter
  if (selectedColors.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedColors.includes(p.color));
  }

  // 6. Pattern filter
  if (selectedPatterns.length > 0) {
    filteredProducts = filteredProducts.filter(p => selectedPatterns.includes(p.pattern));
  }

  // 7. Dynamic Custom Master Type Filters
  Object.keys(dynamicFilters || {}).forEach(key => {
    const selectedVals = dynamicFilters[key];
    if (Array.isArray(selectedVals) && selectedVals.length > 0) {
      filteredProducts = filteredProducts.filter(p => {
        const val = p[key] || p.customMasterData?.[key] || p.custom_master_data?.[key];
        return val && selectedVals.includes(val);
      });
    }
  });

  // 8. Price limit & range filter (from URL searchParams or slider)
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  if (minPriceParam !== null && !isNaN(minPriceParam)) {
    const minP = Number(minPriceParam);
    filteredProducts = filteredProducts.filter(p => p.price >= minP);
  }
  if (maxPriceParam !== null && !isNaN(maxPriceParam)) {
    const maxP = Number(maxPriceParam);
    filteredProducts = filteredProducts.filter(p => p.price <= maxP);
  } else if (!minPriceParam) {
    filteredProducts = filteredProducts.filter(p => p.price <= priceRange);
  }

  // 9. Rating limit filter
  if (minRating > 0) {
    filteredProducts = filteredProducts.filter(p => p.rating >= minRating);
  }

  // 9. Blouse filter
  if (blouseFilter === 'yes') {
    filteredProducts = filteredProducts.filter(p => p.blouseIncluded === true);
  } else if (blouseFilter === 'no') {
    filteredProducts = filteredProducts.filter(p => p.blouseIncluded === false);
  }

  // 10. Availability filter
  if (availabilityFilter === 'inStock') {
    filteredProducts = filteredProducts.filter(p => p.inStock === true);
  } else if (availabilityFilter === 'outOfStock') {
    filteredProducts = filteredProducts.filter(p => p.inStock === false);
  }

  // 11. Sort ordering
  if (sortBy === 'newest') {
    filteredProducts.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  } else if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  // Get current products slice (Pagination/Load More)
  const slicedProducts = filteredProducts.slice(0, visibleCount);

  // Breadcrumb Category text resolver
  let breadcrumbCategory = 'All Sarees';
  if (selectedCollections.length === 1) {
    breadcrumbCategory = selectedCollections[0];
  } else if (selectedFabrics.length === 1) {
    breadcrumbCategory = `${selectedFabrics[0]} Collection`;
  } else if (selectedOccasions.length === 1) {
    breadcrumbCategory = `${selectedOccasions[0]} Occasion`;
  }

  return (
    <div className={styles.shopPage}>
      {/* 1. Breadcrumb navigation */}
      <Breadcrumb categoryName={breadcrumbCategory} />

      {/* 2. Top Toolbar */}
      <Toolbar
        productCount={filteredProducts.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 3. Main Grid layout */}
      <div className={styles.pageContainer}>
        <div className={styles.layoutGrid}>
          {/* Left sticky sidebar */}
          <div className={styles.sidebarCol}>
            <FilterSidebar
              selectedCollections={selectedCollections}
              setSelectedCollections={setSelectedCollections}
              selectedFabrics={selectedFabrics}
              setSelectedFabrics={setSelectedFabrics}
              selectedOccasions={selectedOccasions}
              setSelectedOccasions={setSelectedOccasions}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              selectedPatterns={selectedPatterns}
              setSelectedPatterns={setSelectedPatterns}
              dynamicFilters={dynamicFilters}
              setDynamicFilters={setDynamicFilters}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minRating={minRating}
              setMinRating={setMinRating}
              blouseFilter={blouseFilter}
              setBlouseFilter={setBlouseFilter}
              availabilityFilter={availabilityFilter}
              setAvailabilityFilter={setAvailabilityFilter}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Product Grid */}
          <div className={styles.contentCol}>
            <ProductGrid
              products={slicedProducts}
              isLoading={isLoading}
              viewMode={viewMode}
              onQuickView={setQuickViewProduct}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onResetFilters={handleResetFilters}
              wishlistedIds={wishlistedIds}
            />

            {/* Load More Button */}
            {!isLoading && filteredProducts.length > visibleCount && (
              <div className={styles.loadMoreSection}>
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className={styles.loadMoreBtn}
                >
                  Load More Sarees
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

export default Shop;
