import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import api from '../../services/api';
import styles from './CustomerReviews.module.css';

function CustomerReviews({ productId, rating = 4.8, reviewCount = 24, reviewsList = [] }) {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [reviews, setReviews] = useState(reviewsList);

  // Fetch product reviews dynamically when productId is passed
  useEffect(() => {
    if (productId) {
      let isMounted = true;
      api.getReviews(productId)
        .then((data) => {
          if (isMounted && data.success && data.reviews) {
            setReviews(data.reviews.map(r => ({
              id: r.id,
              name: r.reviewer_name || 'Verified Customer',
              verified: r.is_verified_buyer,
              date: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              rating: r.rating,
              comment: r.comment,
              photos: []
            })));
          }
        })
        .catch((err) => {
          console.log('[CustomerReviews] Using default reviews:', err.message);
        });
      return () => { isMounted = false; };
    }
  }, [productId]);

  const starBreakdown = [
    { stars: 5, count: Math.round(reviewCount * 0.75), percent: 75 },
    { stars: 4, count: Math.round(reviewCount * 0.18), percent: 18 },
    { stars: 3, count: Math.round(reviewCount * 0.05), percent: 5 },
    { stars: 2, count: Math.round(reviewCount * 0.01), percent: 1 },
    { stars: 1, count: 1, percent: 1 }
  ];

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const reviewPayload = {
      rating: newReview.rating,
      comment: newReview.comment,
      reviewerName: newReview.name
    };

    if (productId) {
      api.addReview(productId, reviewPayload)
        .then((data) => {
          if (data.success && data.review) {
            const added = {
              id: data.review.id,
              name: data.review.reviewer_name,
              verified: true,
              date: 'Just now',
              rating: data.review.rating,
              comment: data.review.comment,
              photos: []
            };
            setReviews([added, ...reviews]);
          }
        })
        .catch(() => {
          // Fallback state update
          setReviews([{
            id: Date.now(),
            name: newReview.name,
            verified: true,
            date: 'Just now',
            rating: newReview.rating,
            comment: newReview.comment
          }, ...reviews]);
        });
    } else {
      setReviews([{
        id: Date.now(),
        name: newReview.name,
        verified: true,
        date: 'Just now',
        rating: newReview.rating,
        comment: newReview.comment
      }, ...reviews]);
    }

    setIsWriteModalOpen(false);
    setNewReview({ name: '', rating: 5, comment: '' });
  };

  return (
    <div id="customer-reviews" className={styles.sectionContainer}>
      {/* Header Bar */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Customer Reviews ({reviews.length || reviewCount})</h3>
        <button onClick={() => setIsWriteModalOpen(true)} className={styles.writeReviewBtn}>
          Write a Review
        </button>
      </div>

      {/* Ratings Dashboard */}
      <div className={styles.dashboardGrid}>
        {/* Overall Score Box */}
        <div className={styles.scoreBox}>
          <span className={styles.scoreNumber}>{rating}</span>
          <div className={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={styles.starFilled} />
            ))}
          </div>
          <span className={styles.scoreSubtext}>Based on {reviews.length || reviewCount} reviews</span>
        </div>

        {/* Star Breakdown Progress Bars */}
        <div className={styles.breakdownBox}>
          {starBreakdown.map((row) => (
            <div key={row.stars} className={styles.breakdownRow}>
              <span className={styles.starNum}>{row.stars} ★</span>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${row.percent}%` }}
                />
              </div>
              <span className={styles.countNum}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Photo Reviews List */}
      <div className={styles.reviewsGrid}>
        {reviews.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            {/* User Meta Row */}
            <div className={styles.userRow}>
              <div className={styles.avatarCircle}>
                {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className={styles.userInfo}>
                <h4 className={styles.userName}>{rev.name}</h4>
                {rev.verified && (
                  <span className={styles.verifiedBadge}>
                    <FiCheckCircle /> Verified Buyer
                  </span>
                )}
              </div>
              <span className={styles.reviewDate}>{rev.date}</span>
            </div>

            {/* Rating Stars */}
            <div className={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`${styles.starIcon} ${i < rev.rating ? styles.starFilled : ''}`}
                />
              ))}
            </div>

            {/* Comment */}
            <p className={styles.commentText}>{rev.comment}</p>

            {/* Customer Photo Attachments */}
            {rev.photos && rev.photos.length > 0 && (
              <div className={styles.photosGrid}>
                {rev.photos.map((photoUrl, index) => (
                  <div key={index} className={styles.photoFrame}>
                    <img src={photoUrl} alt={`Review photo ${index + 1}`} className={styles.photoImg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsWriteModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setIsWriteModalOpen(false)}>
              <FiX />
            </button>
            <h3 className={styles.modalTitle}>Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <label className={styles.formLabel}>
                Your Name
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className={styles.formInput}
                />
              </label>

              <label className={styles.formLabel}>
                Rating
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className={styles.formSelect}
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                Your Review
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about fabric quality, color accuracy, and fit..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className={styles.formTextarea}
                />
              </label>

              <button type="submit" className={styles.submitFormBtn}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerReviews;
