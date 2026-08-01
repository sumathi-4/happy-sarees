import React, { useState, useEffect } from 'react';
import { 
  FiStar, FiCheckCircle, FiXCircle, FiTrash2, FiSearch, 
  FiRefreshCw, FiHome, FiImage, FiCheck 
} from 'react-icons/fi';
import { reviewsApi } from '../api/adminApi';

function RatingsReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchReviews = () => {
    setLoading(true);
    reviewsApi.getReviews()
      .then(res => {
        if (res.success && Array.isArray(res.reviews)) {
          setReviews(res.reviews);
        } else {
          setReviews([]);
        }
      })
      .catch(err => {
        console.error('Fetch Admin Reviews Error:', err);
        setReviews([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    setActionLoadingId(id);
    reviewsApi.updateReview(id, { status: newStatus })
      .then(res => {
        if (res.success) {
          setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        }
      })
      .catch(err => alert(err.message || 'Failed to update review status.'))
      .finally(() => setActionLoadingId(null));
  };

  const handleToggleHomepage = (id, currentVal) => {
    const newVal = !currentVal;
    setActionLoadingId(id);
    reviewsApi.updateReview(id, { displayOnHomepage: newVal })
      .then(res => {
        if (res.success) {
          setReviews(prev => prev.map(r => r.id === id ? { ...r, displayOnHomepage: newVal } : r));
        }
      })
      .catch(err => alert(err.message || 'Failed to toggle homepage display.'))
      .finally(() => setActionLoadingId(null));
  };

  const handleSelectFeaturedImage = (id, selectedImg) => {
    setActionLoadingId(id);
    reviewsApi.updateReview(id, { featuredImage: selectedImg })
      .then(res => {
        if (res.success) {
          setReviews(prev => prev.map(r => r.id === id ? { ...r, featuredImage: selectedImg } : r));
        }
      })
      .catch(err => alert(err.message || 'Failed to select featured image.'))
      .finally(() => setActionLoadingId(null));
  };

  const handleDeleteReview = (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review permanently?')) return;
    setActionLoadingId(id);
    reviewsApi.deleteReview(id)
      .then(res => {
        if (res.success) {
          setReviews(prev => prev.filter(r => r.id !== id));
        }
      })
      .catch(err => alert(err.message || 'Failed to delete review.'))
      .finally(() => setActionLoadingId(null));
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = 
      (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Single source of truth for moderating customer reviews, homepage featured reviews, and image selections.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-white)',
            border: '1.5px solid #e2e8f0',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by customer name, product, or review text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'var(--bg-white)', fontWeight: 600 }}
          >
            <option value="All">All Reviews ({reviews.length})</option>
            <option value="pending">Pending Approval ({reviews.filter(r => r.status === 'pending').length})</option>
            <option value="approved">Approved ({reviews.filter(r => r.status === 'approved').length})</option>
            <option value="rejected">Rejected ({reviews.filter(r => r.status === 'rejected').length})</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ background: 'var(--bg-white)', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {loading && reviews.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <FiRefreshCw style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '12px', color: 'var(--primary-color)' }} />
            <p>Loading customer reviews from Neon PostgreSQL...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <FiStar style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 4px 0', color: '#334155' }}>No Reviews Found</h4>
            <p style={{ margin: 0, fontSize: '13.5px' }}>No reviews match your current filter settings.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#27189D', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px' }}>Customer</th>
                <th style={{ padding: '14px 16px' }}>Product</th>
                <th style={{ padding: '14px 16px' }}>Rating & Review</th>
                <th style={{ padding: '14px 16px' }}>Uploaded & Featured Photos</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Homepage</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(r => {
                const isApproved = r.status === 'approved';
                const isRejected = r.status === 'rejected';
                const isPending = r.status === 'pending';
                const imageList = Array.isArray(r.images) ? r.images : [];
                const activeFeatured = r.featuredImage || (imageList.length > 0 ? imageList[0] : null);

                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: actionLoadingId === r.id ? 0.5 : 1 }}>
                    {/* Customer Info */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{r.customerName}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{r.customerEmail}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Product Info */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={r.productImage} 
                          alt={r.productName} 
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                        />
                        <div>
                          <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>{r.productName}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>ID: #{r.productId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Rating & Comment */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '300px' }}>
                      <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', marginBottom: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} fill={i < r.rating ? '#f59e0b' : 'none'} style={{ fontSize: '14px' }} />
                        ))}
                        <span style={{ marginLeft: '6px', fontWeight: 700, color: '#334155', fontSize: '12.5px' }}>{r.rating}.0</span>
                      </div>
                      <p style={{ margin: 0, color: '#334155', fontSize: '13px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        "{r.comment}"
                      </p>
                    </td>

                    {/* Review Photos & Featured Selector */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      {imageList.length > 0 ? (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                            Click image to set Featured:
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {imageList.map((imgUrl, idx) => {
                              const isFeatured = activeFeatured === imgUrl;
                              return (
                                <div 
                                  key={idx} 
                                  onClick={() => handleSelectFeaturedImage(r.id, imgUrl)}
                                  title={isFeatured ? 'Currently Featured Image' : 'Click to set as Featured Image'}
                                  style={{
                                    position: 'relative',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    border: isFeatured ? '2px solid var(--primary-color)' : '1px solid #cbd5e1',
                                    boxShadow: isFeatured ? '0 0 8px rgba(209, 27, 105, 0.4)' : 'none'
                                  }}
                                >
                                  <img src={imgUrl} alt="Review attachment" style={{ width: '46px', height: '46px', objectFit: 'cover', display: 'block' }} />
                                  {isFeatured && (
                                    <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--primary-color)', color: 'var(--bg-white)', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                      <FiCheck />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', italic: 'true' }}>No photos</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      {isApproved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          <FiCheckCircle /> Approved
                        </span>
                      )}
                      {isPending && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          Pending
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                          <FiXCircle /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Display on Home Page Checkbox */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={r.displayOnHomepage}
                          onChange={() => handleToggleHomepage(r.id, r.displayOnHomepage)}
                          style={{ accentColor: 'var(--primary-color)', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: r.displayOnHomepage ? 'var(--primary-color)' : '#64748b' }}>
                          {r.displayOnHomepage ? 'Featured' : 'Off'}
                        </span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {!isApproved && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                            style={{ background: 'var(--success-color)', color: 'var(--bg-white)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                        )}
                        {!isRejected && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            style={{ background: '#dc2626', color: 'var(--bg-white)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                          title="Delete Review"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RatingsReviewsManagement;
