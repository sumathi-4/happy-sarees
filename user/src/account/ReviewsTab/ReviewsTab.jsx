import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiCheckCircle, FiClock, FiXCircle, FiEdit2, FiTrash2, FiX, FiUpload, FiPackage, FiPenTool } from 'react-icons/fi';
import api from '../../services/api';
import styles from './ReviewsTab.module.css';

function ReviewsTab() {
  const [activeSubTab, setActiveSubTab] = useState('submitted'); // 'submitted' or 'pending'
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state for both new review & edit review
  const [writeModalProduct, setWriteModalProduct] = useState(null); // Product object when writing new review
  const [editingReview, setEditingReview] = useState(null); // Review object when editing existing
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = () => {
    setLoading(true);
    Promise.all([
      api.getMyReviews().catch(() => ({ success: false, reviews: [] })),
      api.getPendingReviewProducts().catch(() => ({ success: false, pendingProducts: [] }))
    ])
      .then(([subRes, pendRes]) => {
        const subs = (subRes && subRes.success && Array.isArray(subRes.reviews)) ? subRes.reviews : [];
        const pends = (pendRes && pendRes.success && Array.isArray(pendRes.pendingProducts)) ? pendRes.pendingProducts : [];
        setSubmittedReviews(subs);
        setPendingProducts(pends);
        if (pends.length > 0 && subs.length === 0) {
          setActiveSubTab('pending');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Open modal to write NEW review for a pending product
  const openWriteModal = (prod) => {
    setWriteModalProduct(prod);
    setEditingReview(null);
    setFormData({ rating: 5, comment: '', images: [] });
  };

  // Open modal to EDIT existing review
  const openEditModal = (rev) => {
    setEditingReview(rev);
    setWriteModalProduct(null);
    let parsedImgs = [];
    if (Array.isArray(rev.images)) parsedImgs = rev.images;
    else if (typeof rev.images === 'string') {
      try { parsedImgs = JSON.parse(rev.images); } catch (e) {}
    }
    setFormData({
      rating: rev.rating || 5,
      comment: rev.comment || '',
      images: parsedImgs
    });
  };

  const closeModal = () => {
    setWriteModalProduct(null);
    setEditingReview(null);
    setFormData({ rating: 5, comment: '', images: [] });
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) return;

    setIsSubmitting(true);

    if (writeModalProduct) {
      // Submit new review for pending product
      api.addReview(writeModalProduct.productId, {
        rating: Number(formData.rating),
        comment: formData.comment,
        images: formData.images
      })
        .then((res) => {
          if (res.success) {
            alert('Thank you! Your review has been submitted for Admin approval.');
            closeModal();
            fetchAllData();
            setActiveSubTab('submitted');
          }
        })
        .catch((err) => alert(err.message || 'Failed to submit review.'))
        .finally(() => setIsSubmitting(false));
    } else if (editingReview) {
      // Update existing review
      api.updateReview(editingReview.id, {
        rating: Number(formData.rating),
        comment: formData.comment,
        images: formData.images
      })
        .then((res) => {
          if (res.success) {
            alert('Review updated! It has been submitted for Admin re-approval.');
            closeModal();
            fetchAllData();
          }
        })
        .catch((err) => alert(err.message || 'Failed to update review.'))
        .finally(() => setIsSubmitting(false));
    }
  };

  const handleDeleteReview = (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    api.deleteReview(id)
      .then((res) => {
        if (res.success) {
          setSubmittedReviews(prev => prev.filter(r => r.id !== id));
          fetchAllData();
        }
      })
      .catch((err) => alert(err.message || 'Failed to delete review.'));
  };

  return (
    <div className={styles.tabWrapper}>
      {/* Page Title & Navigation Tabs */}
      <div className={styles.headerRow} style={{ borderBottom: '1px solid #f0e6eb', paddingBottom: '14px', marginBottom: '20px' }}>
        <div>
          <h2 className={styles.tabTitle} style={{ margin: 0 }}>My Reviews & Ratings</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Manage feedback for your delivered sarees and view approval statuses
          </p>
        </div>
      </div>

      {/* Sub Tabs Selector: Pending Reviews vs Submitted Reviews */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveSubTab('submitted')}
          style={{
            padding: '10px 20px',
            borderRadius: '24px',
            border: activeSubTab === 'submitted' ? 'none' : '1.5px solid #cbd5e1',
            background: activeSubTab === 'submitted' ? '#d11b69' : '#ffffff',
            color: activeSubTab === 'submitted' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: activeSubTab === 'submitted' ? '0 4px 12px rgba(209, 27, 105, 0.25)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiCheckCircle /> Submitted Reviews ({submittedReviews.length})
        </button>

        <button
          onClick={() => setActiveSubTab('pending')}
          style={{
            padding: '10px 20px',
            borderRadius: '24px',
            border: activeSubTab === 'pending' ? 'none' : '1.5px solid #cbd5e1',
            background: activeSubTab === 'pending' ? '#d11b69' : '#ffffff',
            color: activeSubTab === 'pending' ? '#ffffff' : '#475569',
            fontWeight: 700,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: activeSubTab === 'pending' ? '0 4px 12px rgba(209, 27, 105, 0.25)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FiPenTool /> Pending Reviews ({pendingProducts.length})
        </button>
      </div>

      {/* TAB 1: PENDING REVIEWS (Delivered items not reviewed yet) */}
      {activeSubTab === 'pending' && (
        <div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <p>Loading delivered products...</p>
            </div>
          ) : pendingProducts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #f0e6eb' }}>
              <FiCheckCircle style={{ fontSize: '2.5rem', color: '#16a34a', marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>All Delivered Products Reviewed!</h4>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                You have reviewed all your delivered orders. Thank you for your feedback!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {pendingProducts.map((prod) => (
                <div key={prod.productId} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f0e6eb', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <img src={prod.image} alt={prod.productName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>{prod.productName}</h4>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Order #{prod.orderNumber}</span>
                      <strong style={{ fontSize: '13px', color: '#d11b69', display: 'block', marginTop: '2px' }}>₹{prod.price.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => openWriteModal(prod)}
                    style={{ width: '100%', background: '#d11b69', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FiPenTool /> Write Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMITTED REVIEWS */}
      {activeSubTab === 'submitted' && (
        <div className={styles.reviewsList}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <p>Loading your submitted reviews...</p>
            </div>
          ) : submittedReviews.length > 0 ? (
            submittedReviews.map((rev) => {
              const isApproved = rev.status === 'approved';
              const isPending = rev.status === 'pending';
              const isRejected = rev.status === 'rejected';
              const imageList = Array.isArray(rev.images) ? rev.images : [];

              return (
                <div key={rev.id} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f0e6eb', padding: '18px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid #f8fafc', paddingBottom: '12px', marginBottom: '12px' }}>
                    <img src={rev.image} alt={rev.productName} style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{rev.productName}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < rev.rating ? styles.starFilled : styles.starEmpty} />
                          ))}
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Reviewed on {rev.date}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isApproved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          <FiCheckCircle /> Approved
                        </span>
                      )}
                      {isPending && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          <FiClock /> Pending Approval
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          <FiXCircle /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 12px 0', lineHeight: '1.5' }}>"{rev.comment}"</p>

                    {/* Display ALL Uploaded Review Photos */}
                    {imageList.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {imageList.map((imgUrl, idx) => (
                          <div key={idx} style={{ width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                            <img src={imgUrl} alt="Review attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px dashed #f1f5f9', paddingTop: '10px' }}>
                      {/* Edit Review: only enabled when status is 'pending' */}
                      {isPending ? (
                        <button
                          onClick={() => openEditModal(rev)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', color: '#334155', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <FiEdit2 /> Edit Review
                        </button>
                      ) : (
                        <span
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'not-allowed' }}
                          title={isApproved ? 'Approved reviews cannot be edited' : 'Rejected reviews cannot be edited'}
                        >
                          <FiEdit2 /> Edit Review
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0e6eb' }}>
              <p style={{ margin: 0, fontSize: '1rem', color: '#666' }}>You haven't submitted any product reviews yet.</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#999' }}>Check the Pending Reviews tab to share feedback on delivered orders!</p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal (Write New or Edit Existing) */}
      {(writeModalProduct || editingReview) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '90%', maxWidth: '480px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button 
              onClick={closeModal}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
            >
              <FiX />
            </button>
            
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {writeModalProduct ? `Write Review for ${writeModalProduct.productName}` : 'Edit Product Review'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
              {writeModalProduct ? 'Your review will be published after Admin approval.' : 'Updating an approved review will submit it for Admin re-approval.'}
            </p>
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Rating</label>
                <select
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                >
                  <option value={5}>5 Stars - Outstanding Quality</option>
                  <option value={4}>4 Stars - Very Good Saree</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Below Expectations</option>
                  <option value={1}>1 Star - Poor Quality</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Review Text</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about fabric weave, color accuracy, and drape..."
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Saree Photos (Max 3)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={imgUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '9px' }}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 3 && (
                    <label style={{ width: '50px', height: '50px', border: '1.5px dashed #cbd5e1', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', color: '#64748b', fontSize: '10px' }}>
                      <FiUpload style={{ fontSize: '14px' }} />
                      Add
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#d11b69', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsTab;
