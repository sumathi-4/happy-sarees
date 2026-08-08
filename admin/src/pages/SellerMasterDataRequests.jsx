import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import styles from '../styles/SellerMasterDataRequests.module.css';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api/admin' : `${window.location.origin}/api/admin`;
function getToken() { return localStorage.getItem('hs_admin_token'); }
async function adminReq(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}

function Badge({ status }) {
  const cls = status === 'approved' ? styles.badgeApproved
             : status === 'rejected' ? styles.badgeRejected
             : styles.badgePending;
  const label = status === 'approved' ? 'Approved'
              : status === 'rejected' ? 'Rejected'
              : 'Pending';
  return (
    <span className={`${styles.badge} ${cls}`}>{label}</span>
  );
}

function formatRequestType(t) {
  if (!t) return 'Add Item';
  return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function renderChangeDetails(r) {
  const type = r.requestType || 'add_item';
  
  let sourceBadge = null;
  if (type === 'add_item' || type === 'add_type') {
    sourceBadge = (
      <div className={`${styles.sourceBadge} ${styles.sourceSeller}`}>
        Seller Proposed
      </div>
    );
  } else if (type === 'edit_item' || type === 'delete_item') {
    const src = r.targetItemSource || 'admin';
    sourceBadge = (
      <div className={`${styles.sourceBadge} ${src === 'seller' ? styles.sourceSeller : styles.sourceAdmin}`}>
        Current Source: {src === 'seller' ? `Seller (${r.targetItemSellerName || 'ID: ' + r.targetItemCreatedBySellerId})` : 'Admin'}
      </div>
    );
  } else if (type === 'edit_type' || type === 'delete_type') {
    const src = r.targetTypeSource || 'admin';
    sourceBadge = (
      <div className={`${styles.sourceBadge} ${src === 'seller' ? styles.sourceSeller : styles.sourceAdmin}`}>
        Current Source: {src === 'seller' ? `Seller (${r.targetTypeSellerName || 'ID: ' + r.targetTypeCreatedBySellerId})` : 'Admin'}
      </div>
    );
  }

  if (type === 'add_item') {
    return (
      <div>
        <strong className={styles.changeDesc}>{r.itemName}</strong>
        {r.payload?.colorHex && (
          <span className={styles.colorIndicator} style={{ backgroundColor: r.payload.colorHex }} />
        )}
        <div className={styles.subText}>
          Under Category: {r.typeName || r.typeSlug}
        </div>
        {sourceBadge}
      </div>
    );
  }
  
  if (type === 'add_type') {
    return (
      <div>
        <strong className={styles.changeDesc}>Type: {r.typeName}</strong>
        <div className={styles.subText}>
          Filters: {r.payload?.showInFilters ? 'Yes' : 'No'} | Specs: {r.payload?.showInSpecifications ? 'Yes' : 'No'}
        </div>
        {sourceBadge}
      </div>
    );
  }

  if (type === 'edit_item') {
    return (
      <div>
        <strong className={styles.changeDesc}>Edit Item ID {r.targetItemId}</strong>
        <div className={styles.subText}>
          New Name: <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>{r.payload?.name || r.itemName}</span>
        </div>
        {r.payload?.colorHex && (
          <div className={styles.subText}>
            Color: {r.payload.colorHex} 
            <span className={styles.colorIndicator} style={{ backgroundColor: r.payload.colorHex, marginLeft: '4px' }} />
          </div>
        )}
        {sourceBadge}
      </div>
    );
  }

  if (type === 'delete_item') {
    return (
      <div>
        <strong style={{ color: 'var(--error-color)' }}>Delete Item ID {r.targetItemId}</strong>
        {sourceBadge}
      </div>
    );
  }

  if (type === 'edit_type') {
    return (
      <div>
        <strong className={styles.changeDesc}>Edit Type ID {r.targetTypeId}</strong>
        <div className={styles.subText}>
          New Name: <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>{r.payload?.name || r.typeName}</span>
        </div>
        {sourceBadge}
      </div>
    );
  }

  if (type === 'delete_type') {
    return (
      <div>
        <strong style={{ color: 'var(--error-color)' }}>Delete Type ID {r.targetTypeId}</strong>
        {sourceBadge}
      </div>
    );
  }

  return (
    <div>
      <span className={styles.changeDesc}>{r.itemName || r.typeName || '—'}</span>
      {sourceBadge}
    </div>
  );
}

function SellerMasterDataRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // {id, itemName}
  const [rejectNote, setRejectNote] = useState('');

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const data = await adminReq('GET', `/seller-master-data-requests?status=${filterStatus}`);
      if (data.success) setRequests(data.requests);
      else setError(data.message || 'Failed to load requests.');
    } catch {
      setError('Network error loading requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(); }, [filterStatus]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      const data = await adminReq('POST', `/seller-master-data-requests/${id}/approve`);
      if (data.success) {
        setSuccess('Request approved and item added to master data.');
        loadRequests();
      } else {
        setError(data.message || 'Failed to approve.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    setError('');
    setSuccess('');
    try {
      const data = await adminReq('POST', `/seller-master-data-requests/${rejectModal.id}/reject`, { adminNote: rejectNote });
      if (data.success) {
        setSuccess('Request rejected.');
        setRejectModal(null);
        setRejectNote('');
        loadRequests();
      } else {
        setError(data.message || 'Failed to reject.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Seller Data Requests</h1>
          <p className={styles.desc}>
            Review and approve or reject seller requests to add new catalog attributes (fabrics, colors, patterns, etc.)
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle /> {error}
        </div>
      )}
      {success && (
        <div className={styles.successAlert}>
          <FiCheckCircle /> {success}
        </div>
      )}

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          onClick={loadRequests}
          className={styles.refreshBtn}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className={styles.empty}>
            <FiClock size={36} className={styles.emptyIcon} />
            <p>No {filterStatus !== 'all' ? filterStatus : ''} requests.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['Seller', 'Request Type', 'Proposed Change', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.storeName}>{r.storeName}</div>
                      <div className={styles.sellerEmail}>{r.sellerEmail}</div>
                    </td>
                    <td className={`${styles.td} ${styles.requestType}`}>
                      {formatRequestType(r.requestType)}
                    </td>
                    <td className={styles.td}>
                      {renderChangeDetails(r)}
                    </td>
                    <td className={`${styles.td} ${styles.reasonText}`}>{r.reason || '—'}</td>
                    <td className={styles.td}><Badge status={r.status} /></td>
                    <td className={`${styles.td} ${styles.dateText}`}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={styles.td}>
                      {r.status === 'pending' ? (
                        <div className={styles.actionGroup}>
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                            className={styles.approveBtn}
                          >
                            <FiCheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: r.id, itemName: r.itemName || r.typeName || `Request #${r.id}` }); setRejectNote(''); }}
                            disabled={actionLoading === r.id}
                            className={styles.rejectBtn}
                          >
                            <FiXCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className={styles.actionNote}>
                          {r.status === 'approved' ? 'Already approved' : `Rejected: ${r.adminNote || ''}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div className={styles.modalOverlay} onClick={() => setRejectModal(null)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Reject Request</h3>
            <p className={styles.modalDesc}>
              Provide a reason for rejecting "<strong>{rejectModal.itemName}</strong>". The seller will be notified.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. This name is already covered by an existing item..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              className={styles.modalTextarea}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setRejectModal(null)} className={styles.modalCancelBtn}>Cancel</button>
              <button onClick={handleReject} disabled={actionLoading === rejectModal.id} className={styles.modalConfirmBtn}>
                {actionLoading === rejectModal.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SellerMasterDataRequests;
