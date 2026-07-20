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
        {reviews.map((rev) => (
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
        ))}
      </div>
    </div>
  );
}

export default ReviewsTab;
