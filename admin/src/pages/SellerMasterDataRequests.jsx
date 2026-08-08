import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api/admin' : `${window.location.origin}/api/admin`;
function getToken() { return localStorage.getItem('hs_admin_token'); }
async function adminReq(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}

const STATUS_COLORS = {
  pending:  { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  approved: { color: '#10b981', bg: '#d1fae5', label: 'Approved' },
  rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
  );
}

function formatRequestType(t) {
  if (!t) return 'Add Item';
  return t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function renderChangeDetails(r) {
  const type = r.requestType || 'add_item';
  
  if (type === 'add_item') {
    return (
      <div>
        <strong>{r.itemName}</strong>
        {r.payload?.colorHex && (
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: r.payload.colorHex, marginLeft: '6px', border: '1px solid #ccc', verticalAlign: 'middle' }} />
        )}
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          Under Category: {r.typeName || r.typeSlug}
        </div>
      </div>
    );
  }
  
  if (type === 'add_type') {
    return (
      <div>
        <strong>Type: {r.typeName}</strong>
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          Filters: {r.payload?.showInFilters ? 'Yes' : 'No'} | Specs: {r.payload?.showInSpecifications ? 'Yes' : 'No'}
        </div>
      </div>
    );
  }

  if (type === 'edit_item') {
    return (
      <div>
        <strong>Edit Item ID {r.targetItemId}</strong>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          New Name: <span style={{ color: '#10b981', fontWeight: 600 }}>{r.payload?.name || r.itemName}</span>
        </div>
        {r.payload?.colorHex && (
          <div style={{ fontSize: '11px' }}>
            Color: {r.payload.colorHex} 
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: r.payload.colorHex, marginLeft: '4px', verticalAlign: 'middle' }} />
          </div>
        )}
      </div>
    );
  }

  if (type === 'delete_item') {
    return (
      <div style={{ color: '#ef4444' }}>
        <strong>Delete Item ID {r.targetItemId}</strong>
      </div>
    );
  }

  if (type === 'edit_type') {
    return (
      <div>
        <strong>Edit Type ID {r.targetTypeId}</strong>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          New Name: <span style={{ color: '#10b981', fontWeight: 600 }}>{r.payload?.name || r.typeName}</span>
        </div>
      </div>
    );
  }

  if (type === 'delete_type') {
    return (
      <div style={{ color: '#ef4444' }}>
        <strong>Delete Type ID {r.targetTypeId}</strong>
      </div>
    );
  }

  return <div>{r.itemName || r.typeName || '—'}</div>;
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

  const containerStyle = { padding: '32px', maxWidth: '1200px' };
  const cardStyle = { background: 'var(--bg-card, #fff)', borderRadius: '16px', border: '1px solid var(--border-color, #e5e7eb)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary, #1a1a2e)' }}>Seller Data Requests</h1>
        <p style={{ color: 'var(--text-secondary, #6b7280)', marginTop: '4px', fontSize: '14px' }}>
          Review and approve or reject seller requests to add new catalog attributes (fabrics, colors, patterns, etc.)
        </p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
          <FiAlertCircle /> {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#d1fae5', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
          <FiCheckCircle /> {success}
        </div>
      )}

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{ padding: '7px 18px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filterStatus === s ? 'var(--primary-color, #7c3aed)' : 'var(--bg-secondary, #f3f4f6)',
              color: filterStatus === s ? '#fff' : 'var(--text-primary, #374151)' }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          onClick={loadRequests}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary, #6b7280)' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary, #9ca3af)' }}>
            <FiClock size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No {filterStatus !== 'all' ? filterStatus : ''} requests.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #e5e7eb)', background: 'var(--bg-secondary, #f9fafb)' }}>
                  {['Seller', 'Request Type', 'Proposed Change', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: 'var(--text-secondary, #6b7280)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color, #f3f4f6)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary, #1a1a2e)', fontSize: '13px' }}>{r.storeName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)' }}>{r.sellerEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary, #374151)', fontWeight: 600 }}>
                      {formatRequestType(r.requestType)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary, #374151)' }}>
                      {renderChangeDetails(r)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary, #6b7280)', maxWidth: '200px' }}>{r.reason || '—'}</td>
                    <td style={{ padding: '14px 16px' }}><Badge status={r.status} /></td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary, #6b7280)', whiteSpace: 'nowrap', fontSize: '12px' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {r.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(r.id)}
                            disabled={actionLoading === r.id}
                            style={{ background: '#d1fae5', color: '#10b981', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FiCheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: r.id, itemName: r.itemName || r.typeName || `Request #${r.id}` }); setRejectNote(''); }}
                            disabled={actionLoading === r.id}
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FiXCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)', fontStyle: 'italic' }}>
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setRejectModal(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '16px', padding: '32px', zIndex: 201, width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Reject Request</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Provide a reason for rejecting "<strong>{rejectModal.itemName}</strong>". The seller will be notified.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. This name is already covered by an existing item..."
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setRejectModal(null)} style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button onClick={handleReject} disabled={actionLoading === rejectModal.id} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
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
