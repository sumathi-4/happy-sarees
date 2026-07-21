import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/mockData';
import api from '../services/api';
import ProductGallery from '../product/ProductGallery/ProductGallery';
import ProductSummary from '../product/ProductSummary/ProductSummary';
import ProductTabs from '../product/ProductTabs/ProductTabs';
import WatchAndBuySection from '../product/WatchAndBuy/WatchAndBuySection';
import CustomerReviews from '../product/CustomerReviews/CustomerReviews';
import RelatedProducts from '../product/RelatedProducts/RelatedProducts';
import RecentlyViewed from '../product/RecentlyViewed/RecentlyViewed';
import { FiPackage, FiArrowLeft } from 'react-icons/fi';
import styles from './ProductDetails.module.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(() => getProductById(id));
  const [loading, setLoading] = useState(false);

  // Scroll to top and fetch product by ID from Neon API
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;
    setLoading(true);

    api.getProductById(id)
      .then((data) => {
        if (isMounted && data.success && data.product) {
          setProduct(data.product);
        }
      })
      .catch((err) => {
        console.log('[ProductDetails] Operating with local fallback product data:', err.message);
        setProduct(getProductById(id));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = (item, qty) => {
    alert(`Added ${qty} unit(s) of "${item.name}" to cart!`);
  };

  const handleBuyNow = (item, qty) => {
    alert(`Proceeding to instant checkout for ${qty} unit(s) of "${item.name}"!`);
  };

  // If Product ID is invalid, display clean "Product Not Found" fallback
  if (!product && !loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.notFoundCard}>
            <div className={styles.notFoundIconCircle}>
              <FiPackage className={styles.notFoundIcon} />
            </div>
            <h2 className={styles.notFoundTitle}>Product Not Found</h2>
            <p className={styles.notFoundText}>
              We couldn't find any saree matching ID "<strong>{id}</strong>". It may have been sold out or removed from our current catalog.
            </p>
            <button onClick={() => navigate('/shop')} className={styles.backToShopBtn}>
              <FiArrowLeft /> Back to Shop Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Header Bar with Previous/Next Controls */}
        <div className={styles.breadcrumbBar}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link to="/" className={styles.crumbLink}>Home</Link>
            <span className={styles.separator}>&gt;</span>
            <Link to="/shop" className={styles.crumbLink}>Shop</Link>
            <span className={styles.separator}>&gt;</span>
            <Link to={`/shop?fabric=${product.fabric || 'Silk'}`} className={styles.crumbLink}>
              {product.fabric || 'Silk'} Sarees
            </Link>
            <span className={styles.separator}>&gt;</span>
            <span className={styles.activeCrumb}>{product.name}</span>
          </nav>

          <div className={styles.prevNextNav}>
            <Link to="/shop" className={styles.navLink}>&lt; Previous</Link>
            <span className={styles.navDivider}>|</span>
            <Link to="/shop" className={styles.navLink}>Next &gt;</Link>
          </div>
        </div>

        {/* Main Product Display Section (Gallery + Summary Grid) */}
        <div className={styles.mainProductGrid}>
          <ProductGallery
            images={product.images || [product.image]}
            productName={product.name}
          />
          <ProductSummary
            product={product}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        {/* Mid Section: Tabbed Information & Specifications */}
        <ProductTabs product={product} />

        {/* Watch & Buy Section */}
        <WatchAndBuySection videos={product.videos} />

        {/* Customer Reviews Section */}
        <CustomerReviews
          productId={product.id}
          rating={product.rating}
          reviewCount={product.reviewCount}
          reviewsList={product.reviewsList}
        />

        {/* Related Products Carousel */}
        <RelatedProducts products={product.relatedProducts} />

        {/* Recently Viewed Products Slider */}
        <RecentlyViewed products={product.recentlyViewed} />
      </div>
    </div>
  );
}

export default ProductDetails;
