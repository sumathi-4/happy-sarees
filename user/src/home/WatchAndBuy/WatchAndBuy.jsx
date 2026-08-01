import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import { api } from '../../services/api';
import styles from './WatchAndBuy.module.css';

function WatchAndBuy() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  const carouselRef = useRef(null);
  const videoRefs = useRef({});

  // Fetch dynamic products with videos from reusable GET /api/products/videos API
  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const res = await api.getProductVideos();
        const videoItems = res.data || res.products || [];
        if (isMounted) {
          if (Array.isArray(videoItems)) {
            setProducts(videoItems);
          } else {
            setProducts([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.log('[WatchAndBuy] Error fetching videos:', err.message);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      }
    };

    fetchVideos();
    return () => { isMounted = false; };
  }, []);

  // Handle Carousel Scroll
  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Video Mouse Interactions: Pause on Hover, Play on Mouse Leave
  const handleMouseEnter = (productId) => {
    setHoveredId(productId);
    const videoEl = videoRefs.current[productId];
    if (videoEl) {
      videoEl.pause();
    }
  };

  const handleMouseLeave = (productId) => {
    setHoveredId(null);
    const videoEl = videoRefs.current[productId];
    if (videoEl) {
      videoEl.play().catch(() => {});
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.tagline}>Loomed Stories & Draping Videos</span>
          <h2 className={styles.title}>Watch & Buy</h2>
          <div className={styles.divider}>
            <span className={styles.dot}></span>
          </div>
        </div>

        {/* Carousel Container */}
        <div className={styles.carouselWrapper}>
          {/* Left Arrow */}
          <button 
            className={`${styles.navBtn} ${styles.navBtnLeft}`} 
            onClick={() => handleScroll('left')}
            aria-label="Scroll Left"
          >
            <FiChevronLeft />
          </button>

          {/* Horizontal Track */}
          <div className={styles.carouselTrack} ref={carouselRef}>
            {products.map((product) => {
              const videoSrc = product.videoUrl || product.video_url || product.video;
              const isHovered = hoveredId === product.id;

              return (
                <div 
                  key={product.id} 
                  className={styles.cardItem}
                  onMouseEnter={() => handleMouseEnter(product.id)}
                  onMouseLeave={() => handleMouseLeave(product.id)}
                >
                  {/* Portrait Video Frame */}
                  <div 
                    className={styles.videoFrame}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <video
                      ref={(el) => (videoRefs.current[product.id] = el)}
                      src={videoSrc}
                      poster={product.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={styles.videoElement}
                    />

                    {/* Dark Gradient Overlay on Hover */}
                    <div className={`${styles.overlay} ${isHovered ? styles.overlayActive : ''}`} />

                    {/* Translucent Play Button Overlay on Hover */}
                    <div className={`${styles.playBtnWrapper} ${isHovered ? styles.playBtnActive : ''}`}>
                      <div className={styles.playBtnCircle}>
                        <FiPlay className={styles.playIcon} />
                      </div>
                    </div>
                  </div>

                  {/* Product Title Only Below Card */}
                  <h3 
                    className={styles.productName}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button 
            className={`${styles.navBtn} ${styles.navBtnRight}`} 
            onClick={() => handleScroll('right')}
            aria-label="Scroll Right"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export default WatchAndBuy;
