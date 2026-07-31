import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiCheckCircle, FiX, FiUpload, FiTrash2, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import styles from './CustomerReviews.module.css';

function CustomerReviews({ productId, rating = 0, reviewCount = 0, reviewsList = [] }) {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviews, setReviews] = useState(reviewsList);
  const [avgScore, setAvgScore] = useState(rating || 0);
  const [totalCount, setTotalCount] = useState(reviewCount);
  const [starBreakdown, setStarBreakdown] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    images: [] // Max 3 image data URLs
  });

  // 1. Fetch Approved Reviews & Stats
  const fetchProductReviews = () => {
    if (!productId) return;
    api.getReviews(productId)
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || []);
          setAvgScore(data.averageRating || 0);
          setTotalCount(data.count || 0);
          setStarBreakdown(data.starBreakdown || []);
        }
      })
      .catch((err) => console.log('[CustomerReviews] Fetch Error:', err.message));
  };

  // 2. Check Customer Eligibility
  const checkEligibility = () => {
    if (!productId) return;
    const token = localStorage.getItem('hs_token');
    if (!token) {
      setCanReview(false);
      return;
    }
    api.checkReviewEligibility(productId)
      .then((res) => {
        if (res.success) {
          setCanReview(Boolean(res.canReview));
          if (res.existingReview) {
            setExistingReview(res.existingReview);
            let parsedImgs = [];
            if (Array.isArray(res.existingReview.images)) parsedImgs = res.existingReview.images;
            else if (typeof res.existingReview.images === 'string') {
              try { parsedImgs = JSON.parse(res.existingReview.images); } catch (e) {}
            }
            setFormData({
              rating: res.existingReview.rating || 5,
              comment: res.existingReview.comment || '',
              images: parsedImgs
            });
          }
        }
      })
      .catch(() => setCanReview(false));
  };

  useEffect(() => {
    fetchProductReviews();
    checkEligibility();
  }, [productId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (formData.images.length + files.length > 3) {
      alert('You can upload a maximum of 3 images per review.');
      return;
    }

    files.slice(0, 3 - formData.images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) return;

    setIsSubmitting(true);
    const payload = {
      rating: Number(formData.rating),
      comment: formData.comment,
      images: formData.images
    };

    api.addReview(productId, payload)
      .then((data) => {
        if (data.success) {
          alert('Thank you! Your review has been submitted for Admin approval.');
          setIsWriteModalOpen(false);
          checkEligibility();
          fetchProductReviews();
        }
      })
      .catch((err) => {
        alert(err.message || 'Failed to submit review.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div id="customer-reviews" className={styles.sectionContainer}>
      {/* Header Bar */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.title}>Customer Reviews ({totalCount})</h3>
        
        {/* Dynamic Review Button Condition */}
        {canReview && existingReview && (existingReview.status === 'approved' || existingReview.status === 'rejected') ? (
          // Approved/Rejected: no edit allowed, show status badge
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: existingReview.status === 'approved' ? '#dcfce7' : '#fee2e2', color: existingReview.status === 'approved' ? '#15803d' : '#b91c1c', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            {existingReview.status === 'approved' ? '✓ Review Approved' : '✗ Review Rejected'}
          </span>
        ) : canReview ? (
          <button onClick={() => setIsWriteModalOpen(true)} className={styles.writeReviewBtn}>
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </button>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
            <FiInfo /> Available after delivery.
          </div>
        )}
      </div>

      {/* Ratings Dashboard */}
      <div className={styles.dashboardGrid}>
        {/* Overall Score Box */}
        <div className={styles.scoreBox}>
          <span className={styles.scoreNumber}>{totalCount > 0 ? Number(avgScore || 0).toFixed(1) : '0.0'}</span>
          <div className={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={totalCount > 0 && i < Math.round(avgScore) ? styles.starFilled : styles.starEmpty} />
            ))}
          </div>
          <span className={styles.scoreSubtext}>Based on {totalCount} reviews</span>
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
        {reviews.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No verified customer reviews published for this saree yet.</p>
          </div>
        ) : (
          reviews.map((rev) => (
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

              {/* Display ALL Uploaded Review Photos */}
              {rev.photos && rev.photos.length > 0 && (
                <div className={styles.photosGrid} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {rev.photos.map((photoUrl, index) => (
                    <div key={index} className={styles.photoFrame} style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={photoUrl} alt={`Review photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write / Edit Review Modal */}
      {isWriteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsWriteModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className={styles.closeModalBtn} onClick={() => setIsWriteModalOpen(false)}>
              <FiX />
            </button>
            <h3 className={styles.modalTitle}>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
            
            <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
              <label className={styles.formLabel}>
                Rating
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className={styles.formSelect}
                >
                  <option value={5}>5 Stars - Outstanding Quality</option>
                  <option value={4}>4 Stars - Very Good Saree</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Below Expectations</option>
                  <option value={1}>1 Star - Poor Quality</option>
                </select>
              </label>

              <label className={styles.formLabel}>
                Your Detailed Review
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about fabric weave, color accuracy, and drape..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className={styles.formTextarea}
                />
              </label>

              {/* Upload Review Photos (Max 3) */}
              <div style={{ margin: '14px 0' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Upload Saree Photos (Max 3)
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={imgUrl} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 3 && (
                    <label style={{ width: '56px', height: '56px', border: '1.5px dashed #cbd5e1', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', color: '#64748b', fontSize: '11px' }}>
                      <FiUpload style={{ fontSize: '16px', marginBottom: '2px' }} />
                      Add
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitFormBtn}>
                {isSubmitting ? 'Submitting...' : (existingReview ? 'Update Review (Submit for Re-Approval)' : 'Submit Review')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerReviews;
