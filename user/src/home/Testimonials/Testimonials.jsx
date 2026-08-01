import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Testimonials.module.css';

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchApprovedReviews() {
      try {
        const res = await api.getApprovedReviews();
        if (res && res.success && Array.isArray(res.reviews)) {
          if (isMounted) setReviews(res.reviews);
        } else {
          if (isMounted) setReviews([]);
        }
      } catch (err) {
        console.warn('[Testimonials] API Fetch Notice:', err.message);
        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchApprovedReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>CUSTOMER REVIEWS</h2>
        </div>
        <div className={styles.loadingSkeletonContainer}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  // Clean empty state if no approved reviews with homepage display exist
  if (!reviews || reviews.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>CUSTOMER REVIEWS</h2>
        </div>
        <div className={styles.emptyState} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>No featured customer reviews published for the homepage yet.</p>
        </div>
      </section>
    );
  }

  // Limit display to max 4 latest reviews allowed by admin
  const displayedReviews = reviews.slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.title}>CUSTOMER REVIEWS</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        {/* Display Max 4 Stacked Polaroid Cards (No Next/Previous Buttons) */}
        <div className={styles.carousel}>
          {displayedReviews.map((item, idx) => {
            // Display ONLY the Featured Image selected by Admin (or first image)
            const customerImage = item.featuredImage || item.image || item.image_data || (Array.isArray(item.images) ? item.images[0] : null);
            const reviewerName = item.name || item.reviewer || 'Verified Buyer';
            const reviewComment = item.comment || '';
            const ratingScore = Number(item.rating) || 5;

            return (
              <div key={item.id || idx} className={styles.reviewCard}>
                {/* 1. Review Quote Text ABOVE photo */}
                <div className={styles.quoteBox}>
                  <p className={styles.quoteText}>"{reviewComment}"</p>
                </div>

                {/* 2. Stacked Photo Frame Container */}
                <div className={styles.photoStack}>
                  <div className={styles.stackBackLayer1} />
                  <div className={styles.stackBackLayer2} />
                  <div className={styles.photoFrameFront}>
                    {customerImage ? (
                      <img 
                        src={customerImage} 
                        alt={reviewerName} 
                        className={styles.customerPhoto} 
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b', fontSize: '24px', fontWeight: 'bold' }}>
                        {reviewerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Below Photo Frame: Stars and Customer Name */}
                <div className={styles.metaFooter}>
                  <div className={styles.starsGroup}>
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < ratingScore ? styles.starFilled : styles.starEmpty}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={styles.customerName}>_{reviewerName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
