import React, { useEffect, useState } from 'react';
import { 
  FiCheck, FiX, FiEye, FiSearch, FiFileText, FiPhone, FiMail, FiMapPin, FiBriefcase 
} from 'react-icons/fi';
import { sellersApi } from '../api/adminApi';
import styles from '../styles/SellerManagement.module.css';

function SellerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected request details panel drawer
  const [selectedId, setSelectedId] = useState(null);
  const activeReq = selectedId ? requests.find(r => r.id === selectedId) : null;

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  async function loadRequests() {
    setLoading(true);
    try {
      const res = await sellersApi.getRequests();
      if (res.success) {
        setRequests(res.requests);
      } else {
        setErrorMsg('Failed to load pending seller requests.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id, name) => {
    if (window.confirm(`Are you sure you want to APPROVE the seller application for "${name}"?`)) {
      try {
        const res = await sellersApi.approve(id);
        if (res.success) {
          alert(`Seller "${name}" approved successfully. A welcome notification has been sent.`);
          if (selectedId === id) setSelectedId(null);
          loadRequests();
        } else {
          alert('Failed to approve seller.');
        }
      } catch (err) {
        alert(err.message || 'An error occurred.');
      }
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectionReason('');
    setAdminNotes('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason for compliance records.');
      return;
    }
    const name = requests.find(r => r.id === rejectId)?.storeName || 'Seller';
    try {
      const res = await sellersApi.reject(rejectId, {
        reason: rejectionReason,
        adminNotes
      });
      if (res.success) {
        alert(`Application for "${name}" has been rejected.`);
        setShowRejectModal(false);
        if (selectedId === rejectId) setSelectedId(null);
        loadRequests();
      } else {
        alert('Failed to reject application.');
      }
    } catch (err) {
      alert(err.message || 'An error occurred.');
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.businessName.toLowerCase().includes(q) ||
      r.storeName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Verification Requests</h1>
          <p className={styles.desc}>Review incoming registrations, audit corporate credentials, PAN details, and bank information.</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      <div className={`${styles.contentGrid} ${activeReq ? styles.contentGridHasPanel : ''}`}>
        
        {/* Left Column: Requests Table */}
        <div className={styles.leftColumn}>
          <div className={styles.cardHeaderBar}>
            <h3>Pending Applications ({filteredRequests.length})</h3>
            <div className={styles.filterControls}>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by store or owner name..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>Loading verification queues...</div>
            ) : filteredRequests.length === 0 ? (
              <div className={styles.empty}>
                No pending seller verification requests. Excellent! All queues clear.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Boutique Store</th>
                    <th className={styles.th}>Weaver Owner</th>
                    <th className={styles.th}>Contact Info</th>
                    <th className={styles.th}>Location</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(r => (
                    <tr key={r.id} className={`${styles.tr} ${selectedId === r.id ? styles.trActive : ''}`}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {r.storeLogoUrl ? (
                            <img src={r.storeLogoUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                              {(r.storeName || '').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: 700 }}>{r.storeName}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{(r.businessCategory || 'N/A').toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>{r.ownerName}</td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                          <span>{r.email}</span>
                          <span style={{ color: 'var(--text-light)' }}>{r.phone}</span>
                        </div>
                      </td>
                      <td className={styles.td}>{r.city}, {r.state}</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actionIconGroup} style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className={`${styles.iconBtn} ${styles.iconBtnView}`}
                            onClick={() => setSelectedId(r.id)}
                            title="Audit Documents"
                          >
                            <FiEye />
                          </button>
                          <button 
                            className={`${styles.iconBtn} ${styles.iconBtnApprove}`}
                            onClick={() => handleApprove(r.id, r.storeName)}
                            title="Approve Shop"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            className={`${styles.iconBtn} ${styles.iconBtnReject}`}
                            onClick={() => openRejectModal(r.id)}
                            title="Reject Application"
                          >
                            <FiX />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Audit Drawer Panel */}
        {activeReq && (
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <h3>Verification Audit Dossier</h3>
              </div>
              <button className={styles.iconBtn} onClick={() => setSelectedId(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.panelBody}>
              {/* Logo Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {activeReq.storeLogoUrl ? (
                  <img src={activeReq.storeLogoUrl} alt={activeReq.storeName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-color)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gold-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px' }}>
                    {(activeReq.storeName || '').charAt(0).toUpperCase()}
                  </div>
                )}
                <h4 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-serif)', fontSize: '16px' }}>{activeReq.storeName}</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-light)', textTransform: 'uppercase' }}>PAN: {activeReq.panNumber}</span>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Corporate Info</h4>
                <div className={styles.infoRow}>
                  <span>Legal entity:</span>
                  <span className={styles.infoVal}>{activeReq.businessName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Brand category:</span>
                  <span className={styles.infoVal}>{activeReq.businessCategory || 'N/A'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Brand story:</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', textAlign: 'left', marginTop: '4px' }}>
                    {activeReq.businessDescription}
                  </span>
                </div>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Settlement Bank Account</h4>
                <div className={styles.infoRow}>
                  <span>Beneficiary name:</span>
                  <span className={styles.infoVal}>{activeReq.bankAccountName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Account Number:</span>
                  <span className={styles.infoVal} style={{ letterSpacing: '0.5px' }}>{activeReq.bankAccountNo}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Bank name:</span>
                  <span className={styles.infoVal}>{activeReq.bankName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>IFSC code:</span>
                  <span className={styles.infoVal} style={{ fontFamily: 'monospace' }}>{activeReq.bankIfsc}</span>
                </div>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Compliance Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeReq.documents && activeReq.documents.length > 0 ? (
                    activeReq.documents.map((d, index) => (
                      <a 
                        key={index} 
                        href={d.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className={styles.docLink}
                      >
                        <FiFileText /> {d.docType.replace('_', ' ').toUpperCase()} (View File)
                      </a>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>No verification document uploads found.</span>
                  )}
                </div>
              </div>

              {/* Bottom audit decision */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => handleApprove(activeReq.id, activeReq.storeName)}
                >
                  <FiCheck /> Approve Store
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => openRejectModal(activeReq.id)}
                >
                  <FiX /> Reject Request
                </button>
              </div>

            </div>
          </aside>
        )}

      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Reject Vendor Application</h3>
              <button className={styles.iconBtn} onClick={() => setShowRejectModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Rejection Reason (Sent to Vendor)</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="e.g. Uploaded cancelled cheque is blur. Please re-apply with clear bank statement."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>This comment is visible to the seller on their login dashboard.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Internal Admin Notes (Private)</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  placeholder="e.g. Verification check failed. Suspicious document headers."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
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

export default SellerRequests;
