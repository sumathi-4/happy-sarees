import React, { useState } from 'react';
import { FiMaximize2, FiX } from 'react-icons/fi';
import styles from './ProductGallery.module.css';

function ProductGallery({ images = [], discountBadge = '22% OFF', productName = 'Saree' }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  if (!images.length) return null;

  const currentImage = images[activeImageIndex] || images[0];

  return (
    <div className={styles.galleryContainer}>
      {/* Vertical Thumbnails List */}
      <div className={styles.thumbnailCol}>
        <div className={styles.thumbnailList}>
          {images.map((imgUrl, index) => (
            <button
              key={index}
              className={`${styles.thumbBtn} ${activeImageIndex === index ? styles.activeThumb : ''}`}
              onClick={() => setActiveImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={imgUrl} alt={`${productName} thumbnail ${index + 1}`} className={styles.thumbImage} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Display Image Frame */}
      <div className={styles.mainImageFrame}>
        <img src={currentImage} alt={productName} className={styles.mainImage} />

        {/* Discount Badge */}
        {discountBadge && (
          <span className={styles.discountBadge}>{discountBadge}</span>
        )}

        {/* Zoom Trigger Button */}
        <button
          className={styles.zoomTriggerBtn}
          onClick={() => setIsZoomModalOpen(true)}
          title="Zoom image"
          aria-label="Zoom image"
        >
          <FiMaximize2 />
        </button>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div className={styles.zoomModalOverlay} onClick={() => setIsZoomModalOpen(false)}>
          <div className={styles.zoomModalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeZoomBtn}
              onClick={() => setIsZoomModalOpen(false)}
              aria-label="Close zoom modal"
            >
              <FiX />
            </button>
            <img src={currentImage} alt={`${productName} zoomed`} className={styles.zoomedImage} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
