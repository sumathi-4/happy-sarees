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

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top and fetch product by ID from Neon PostgreSQL DB
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
        console.warn('[ProductDetails] Live fetch warning:', err.message);
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

        {/* Product Video Feature (Uploaded Video File or YouTube/Vimeo Embed) */}
        {(product.videoData || product.videoUrl || product.video) && (
          <div style={{ marginTop: '32px', padding: '24px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#2b2b2b' }}>
              🎥 Product Draping Video
            </h3>
            {product.videoData ? (
              <video 
                src={product.videoData} 
                controls 
                style={{ width: '100%', maxHeight: '480px', borderRadius: '8px', backgroundColor: '#000000' }} 
              />
            ) : product.videoUrl?.includes('youtube') || product.videoUrl?.includes('youtu.be') ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                <iframe 
                  src={`https://www.youtube.com/embed/${(product.videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/) || [])[1] || ''}`}
                  title="Product Video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              </div>
            ) : product.videoUrl?.includes('vimeo') ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                <iframe 
                  src={`https://player.vimeo.com/video/${(product.videoUrl.match(/vimeo\.com\/(\d+)/) || [])[1] || ''}`}
                  title="Product Video"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              </div>
            ) : (
              <video controls style={{ width: '100%', maxHeight: '480px', borderRadius: '8px' }}>
                <source src={product.videoUrl || product.video} />
              </video>
            )}
          </div>
        )}

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
