import React from 'react';
import { FaStar } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './ReviewsTab.module.css';

function ReviewsTab({ reviews = [] }) {
  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.tabTitle}>My Reviews & Ratings</h2>
          <span className={styles.subCount}>{reviews.length} Reviews Submitted</span>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className={styles.reviewCard}>
              <div className={styles.cardHeader}>
                <img src={rev.image} alt={rev.productName} className={styles.thumb} />
                <div className={styles.meta}>
                  <h4 className={styles.productName}>{rev.productName}</h4>
                  <div className={styles.ratingRow}>
                    <div className={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${styles.starIcon} ${i < rev.rating ? styles.starFilled : ''}`}
                        />
                      ))}
                    </div>
                    <span className={styles.dateText}>Reviewed on {rev.date}</span>
                  </div>
                </div>

                <span className={styles.verifiedTag}>
                  <FiCheckCircle /> Verified Purchase
                </span>
              </div>

              <div className={styles.cardBody}>
                <h5 className={styles.revTitle}>"{rev.title}"</h5>
                <p className={styles.comment}>"{rev.comment}"</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0e6eb' }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>You haven't submitted any product reviews yet.</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#999' }}>Share your feedback on delivered orders to earn reward points!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsTab;
