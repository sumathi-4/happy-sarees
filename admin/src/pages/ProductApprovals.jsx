import React, { useEffect, useState } from 'react';
import { 
  FiCheck, FiX, FiEye, FiSearch, FiInfo, FiLayers, FiTag, FiFolder, FiAlertCircle 
} from 'react-icons/fi';
import { productApprovalsApi } from '../api/adminApi';
import styles from '../styles/SellerManagement.module.css';

const TABS = [
  { id: 'pending', label: 'Pending Queue' },
  { id: 'approved', label: 'Approved Products' },
  { id: 'rejected', label: 'Rejected' },
  { id: '', label: 'All Submissions' }
];

function ProductApprovals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');

  // Selected product details dossier panel
  const [selectedId, setSelectedId] = useState(null);
  const activeProd = selectedId ? products.find(p => p.id === selectedId) : null;

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Live sidebar badge for pending count
  const [pendingCount, setPendingCount] = useState(0);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = {};
      if (activeTab) params.status = activeTab;
      if (search) params.search = search;

      const res = await productApprovalsApi.getAll(params);
      if (res.success) {
        setProducts(res.products);
        
        // Update counts
        const allRes = await productApprovalsApi.getAll({ status: 'pending' });
        if (allRes.success) {
          setPendingCount(allRes.products.length);
        }
      } else {
        setErrorMsg('Failed to load product approvals.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [activeTab, search]);

  const handleApprove = async (id, name) => {
    if (window.confirm(`Are you sure you want to APPROVE and make public "${name}"?`)) {
      try {
        const res = await productApprovalsApi.approve(id);
        if (res.success) {
          alert(`Product "${name}" approved successfully and published in buyer catalog.`);
          if (selectedId === id) setSelectedId(null);
          loadProducts();
        }
      } catch (err) {
        alert(err.message || 'Failed to approve product.');
      }
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason explaining what details mismatch.');
      return;
    }
    const name = products.find(p => p.id === rejectId)?.name || 'Product';
    try {
      const res = await productApprovalsApi.reject(rejectId, rejectionReason);
      if (res.success) {
        alert(`Product "${name}" application rejected.`);
        setShowRejectModal(false);
        if (selectedId === rejectId) setSelectedId(null);
        loadProducts();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject product.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Verification</span>;
      case 'approved': return <span className={`${styles.badge} ${styles.badgeApproved}`}>Approved</span>;
      case 'rejected': return <span className={`${styles.badge} ${styles.badgeRejected}`}>Rejected</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Product Catalog Approvals</h1>
          <p className={styles.desc}>Moderate newly listed sarees, audit descriptions, and inspect fabric attributes before store launch.</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className={styles.cardHeaderBar} style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-premium) var(--radius-premium) 0 0', border: '1px solid rgba(43, 18, 32, 0.06)', borderBottom: 'none', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 700,
                color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper} style={{ margin: '10px 0' }}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search products..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={`${styles.contentGrid} ${activeProd ? styles.contentGridHasPanel : ''}`}>
        
        {/* Left Column: Product Grid/Table */}
        <div className={styles.leftColumn} style={{ borderRadius: '0 0 var(--radius-premium) var(--radius-premium)', borderTop: 'none' }}>
          <div className={styles.tableContainer}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>Loading products approvals queues...</div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                No products found in this approval bucket.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Saree</th>
                    <th className={styles.th}>Boutique / Seller</th>
                    <th className={styles.th}>Pricing</th>
                    <th className={styles.th}>Weave Specs</th>
                    <th className={styles.th}>Stock</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className={`${styles.tr} ${selectedId === p.id ? styles.trActive : ''}`}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={p.image} alt="" style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{p.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>SKU: {p.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{p.storeName || 'Independent Weaver'}</td>
                      <td className={styles.td}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-color)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                      </td>
                      <td className={styles.td} style={{ fontStyle: 'italic', textTransform: 'capitalize' }}>
                        {p.fabric} / {p.color}
                      </td>
                      <td className={styles.td} style={{ fontWeight: 600 }}>{p.stockCount} packs</td>
                      <td className={styles.td}>{getStatusBadge(p.approvalStatus)}</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actionIconGroup} style={{ justifyContents: 'flex-end', justifyContent: 'flex-end' }}>
                          <button 
                            className={`${styles.iconBtn} ${styles.iconBtnView}`}
                            onClick={() => setSelectedId(p.id)}
                            title="Inspect Details"
                          >
                            <FiEye />
                          </button>
                          {p.approvalStatus === 'pending' && (
                            <>
                              <button 
                                className={`${styles.iconBtn} ${styles.iconBtnApprove}`}
                                onClick={() => handleApprove(p.id, p.name)}
                                title="Approve & Publish"
                              >
                                <FiCheck />
                              </button>
                              <button 
                                className={`${styles.iconBtn} ${styles.iconBtnReject}`}
                                onClick={() => openRejectModal(p.id)}
                                title="Reject Product"
                              >
                                <FiX />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Product Audit Panel */}
        {activeProd && (
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <h3>Saree Specifications</h3>
              </div>
              <button className={styles.iconBtn} onClick={() => setSelectedId(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.panelBody}>
              {/* Product Gallery Carousel / Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <img src={activeProd.image} alt="" style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', boxShadow: 'var(--shadow-premium)' }} />
                <h4 style={{ margin: '8px 0 0 0', fontFamily: 'var(--font-serif)', fontSize: '15px', textAlign: 'center' }}>{activeProd.name}</h4>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-color)' }}>₹{activeProd.price.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Weaving Attributes</h4>
                <div className={styles.infoRow}>
                  <span>Fabric:</span>
                  <span className={styles.infoVal}>{activeProd.fabric}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Weave Type:</span>
                  <span className={styles.infoVal}>{activeProd.weave || 'Standard'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Main Color:</span>
                  <span className={styles.infoVal}>{activeProd.color}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Border Style:</span>
                  <span className={styles.infoVal}>{activeProd.border || 'Plain border'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Pallu Design:</span>
                  <span className={styles.infoVal}>{activeProd.pallu || 'Plain pallu'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Occasion Suitability:</span>
                  <span className={styles.infoVal}>{activeProd.occasion || 'Bridal/Party'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Dimensions (H × W):</span>
                  <span className={styles.infoVal}>{activeProd.height || '5.5m'} × {activeProd.width || '1.1m'}</span>
                </div>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Description text</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  {activeProd.description}
                </p>
              </div>

              {activeProd.approvalStatus === 'rejected' && activeProd.rejectionReason && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--error-bg)', border: '1px solid var(--error-color)', fontSize: '12px', color: 'var(--error-color)' }}>
                  <strong>Rejection Reason:</strong> {activeProd.rejectionReason}
                </div>
              )}

              {activeProd.approvalStatus === 'pending' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => handleApprove(activeProd.id, activeProd.name)}
                  >
                    <FiCheck /> Approve Listing
                  </button>
                  <button 
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => openRejectModal(activeProd.id)}
                  >
                    <FiX /> Reject Listing
                  </button>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Reject Saree Listing</h3>
              <button className={styles.iconBtn} onClick={() => setShowRejectModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Reason for Rejection (Visible to Seller)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="e.g. Saree fabric category does not match description keywords. Image colors look overly saturated. Please edit specifications."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  This reason is shown on their seller roster catalog to help them correct and resubmit.
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={handleRejectSubmit}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductApprovals;
