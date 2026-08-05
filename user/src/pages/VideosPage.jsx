import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag, FiEye, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import styles from './VideosPage.module.css';

function VideosPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    api.getProductVideos()
      .then((res) => {
        if (isMounted) {
          const items = res.data || res.products || [];
          setProducts(Array.isArray(items) ? items : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[VideosPage] Fetch error:', err.message);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Header */}
        <div className={styles.breadcrumbBar}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link to="/" className={styles.crumbLink}>Home</Link>
            <span className={styles.separator}>&gt;</span>
            <span className={styles.activeCrumb}>Watch & Buy Draping Videos</span>
          </nav>

          <button onClick={() => navigate('/shop')} className={styles.backBtn}>
            <FiArrowLeft /> Back to Shop
          </button>
        </div>

        {/* Hero Section */}
        <div className={styles.heroSection}>
          <span className={styles.heroTagline}>🎥 Loomed Stories & Video Gallery</span>
          <h1 className={styles.heroTitle}>Saree Draping & Live Showcase</h1>
          <p className={styles.heroSubtitle}>
            Watch authentic video draping demos of our handcrafted sarees and shop your favorite look directly.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p>Loading draping videos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No Videos Available Right Now</h3>
            <p>Check back soon for new saree draping video uploads!</p>
            <button onClick={() => navigate('/shop')} className={styles.shopBtn}>
              Explore Saree Collection
            </button>
          </div>
        ) : (
          <div className={styles.videoGrid}>
            {products.map((product) => {
              const videoSrc = product.videoUrl || product.video_url || product.video;

              return (
                <div 
                  key={product.id} 
                  className={styles.videoCard}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Portrait Video Frame */}
                  <div className={styles.videoBox}>
                    <video
                      src={videoSrc}
                      poster={product.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={styles.videoElement}
                    />
                    <div className={styles.overlay} />
                  </div>

                  {/* Product Title Below Card */}
                  <h3 className={styles.productName}>{product.name}</h3>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideosPage;
