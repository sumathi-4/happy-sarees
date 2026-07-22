import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlay, FiShoppingCart, FiX } from 'react-icons/fi';
import { WATCH_AND_BUY_VIDEOS, PRODUCTS } from '../../data/mockData';
import styles from './WatchAndBuy.module.css';

function WatchAndBuy() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(null);

  const getProductForVideo = (productId) => {
    return PRODUCTS.find((p) => p.id === productId);
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Loomed Stories & Draping Videos</span>
        <h2 className={styles.title}>Watch & Buy</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.grid}>
        {WATCH_AND_BUY_VIDEOS.map((video) => {
          const product = getProductForVideo(video.productId);
          return (
            <div key={video.id} className={styles.card}>
              <div className={styles.thumbnailWrapper}>
                <img src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
                <span className={styles.duration}>{video.duration}</span>
                
                {/* Play Button Overlay */}
                <button 
                  onClick={() => setActiveVideo(video)} 
                  className={styles.playBtn}
                  aria-label="Play Story"
                >
                  <FiPlay />
                </button>

                {/* Shop This Look Button */}
                {product && (
                  <div className={styles.shopOverlay}>
                    <div className={styles.productBrief}>
                      <span className={styles.pName}>{product.name}</span>
                      <span className={styles.pPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className={styles.shopBtn}
                    >
                      <FiShoppingCart /> Shop Look
                    </button>
                  </div>
                )}
              </div>
              <h3 className={styles.cardTitle}>{video.title}</h3>
            </div>
          );
        })}
      </div>

      {/* Video Modal (Simulated Video Playback) */}
      {activeVideo && (
        <div className={styles.modalOverlay} onClick={() => setActiveVideo(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveVideo(null)} aria-label="Close player">
              <FiX />
            </button>
            <div className={styles.modalBody}>
              {/* Simulated Video Player */}
              <div className={styles.videoPlayer}>
                <div className={styles.playerPlaceholder}>
                  <img src={activeVideo.thumbnail} alt="Video playback" className={styles.playerBg} />
                  <div className={styles.playerOverlay}>
                    <FiPlay className={styles.playerPlayIcon} />
                    <p className={styles.playingText}>Playing: {activeVideo.title}...</p>
                  </div>
                </div>
              </div>
              
              {/* Product Card Linked to the Video */}
              {getProductForVideo(activeVideo.productId) && (() => {
                const p = getProductForVideo(activeVideo.productId);
                return (
                  <div className={styles.linkedProduct}>
                    <h4 className={styles.linkTitle}>Featured Saree</h4>
                    <Link to={`/product/${p.id}`} onClick={() => setActiveVideo(null)}>
                      <img src={p.image} alt={p.name} className={styles.linkImg} />
                    </Link>
                    <span className={styles.linkFabric}>{p.fabric}</span>
                    <h5 className={styles.linkName}>
                      <Link to={`/product/${p.id}`} onClick={() => setActiveVideo(null)} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </h5>
                    <div className={styles.linkPriceRow}>
                      <span className={styles.linkPrice}>₹{p.price.toLocaleString('en-IN')}</span>
                      <span className={styles.linkOriginal}>₹{p.originalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveVideo(null);
                        navigate(`/product/${p.id}`);
                      }}
                      className={styles.linkBuyBtn}
                    >
                      View Product Details
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default WatchAndBuy;
