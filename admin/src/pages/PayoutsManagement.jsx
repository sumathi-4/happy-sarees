import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';

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
  pending:    { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  processing: { color: '#3b82f6', bg: '#dbeafe', label: 'Processing' },
  paid:       { color: '#10b981', bg: '#d1fae5', label: 'Paid' },
  failed:     { color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ background: s.bg, color: s.color, padding: '3px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{s.label}</span>;
}

function PayoutsManagement() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ sellerId: '', periodStart: '', periodEnd: '' });
  const [genLoading, setGenLoading] = useState(false);

  async function loadPayouts() {
    setLoading(true);
    setError('');
    try {
      const data = await adminReq('GET', `/payouts?status=${filterStatus}`);
      if (data.success) setPayouts(data.payouts);
      else setError(data.message || 'Failed to load payouts.');
    } catch {
      setError('Network error loading payouts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayouts(); }, [filterStatus]);

  const handleMarkPaid = async (id) => {
    setActionLoading(id);
    setError('');
    setSuccess('');
    try {
      const data = await adminReq('PUT', `/payouts/${id}/mark-paid`, { adminNote: 'Marked paid via admin panel' });
      if (data.success) { setSuccess('Payout marked as paid.'); loadPayouts(); }
      else setError(data.message || 'Failed to mark paid.');
    } catch { setError('Network error.'); }
    finally { setActionLoading(null); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.sellerId || !genForm.periodStart || !genForm.periodEnd) {
      setError('All fields are required to generate a payout.'); return;
    }
    setGenLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await adminReq('POST', '/payouts/generate', genForm);
      if (data.success) {
        setSuccess(`Payout #${data.payoutId} generated: ₹${Number(data.totalNet).toFixed(2)} net for ${data.itemCount} items.`);
        setGenerateModal(false);
        setGenForm({ sellerId: '', periodStart: '', periodEnd: '' });
        loadPayouts();
      } else setError(data.message || 'Failed to generate payout.');
    } catch { setError('Network error generating payout.'); }
    finally { setGenLoading(false); }
  };

  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

  const containerStyle = { padding: '32px', maxWidth: '1300px' };
  const cardStyle = { background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700 }}>Payouts Management</h1>
          <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>Generate, review and process seller payouts.</p>
        </div>
        <button
          onClick={() => setGenerateModal(true)}
          style={{ background: 'var(--primary-color, #7c3aed)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiDollarSign /> Generate Payout
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}><FiAlertCircle /> {error}</div>}
      {success && <div style={{ background: '#d1fae5', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}><FiCheckCircle /> {success}</div>}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b,#d97706)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
          <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '6px' }}>⏳ Total Pending</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #10b981,#059669)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
          <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '6px' }}>✅ Total Paid Out</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #6366f1,#4f46e5)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
          <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '6px' }}>📋 Total Records</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{payouts.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        {['all', 'pending', 'processing', 'paid', 'failed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filterStatus === s ? 'var(--primary-color, #7c3aed)' : '#f3f4f6',
              color: filterStatus === s ? '#fff' : '#374151' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button onClick={loadPayouts} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', color: '#6b7280', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <FiClock size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No payouts found for this filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                  {['ID', 'Seller', 'Period', 'Amount (Net)', 'Status', 'Paid On', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#7c3aed' }}>#{p.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.storeName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.sellerEmail}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#374151', whiteSpace: 'nowrap', fontSize: '13px' }}>
                      {p.periodStart ? `${new Date(p.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(p.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: p.amount < 0 ? '#ef4444' : '#10b981' }}>
                      {p.amount < 0 ? '−' : ''}₹{Math.abs(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px 16px' }}><Badge status={p.status} /></td>
                    <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.status === 'pending' || p.status === 'processing' ? (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          disabled={actionLoading === p.id}
                          style={{ background: '#d1fae5', color: '#10b981', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <FiCheckCircle size={13} /> {actionLoading === p.id ? 'Processing...' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payout Modal */}
      {generateModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setGenerateModal(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '16px', padding: '32px', zIndex: 201, width: '460px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '20px', marginBottom: '20px' }}>Generate Seller Payout</h3>
            <form onSubmit={handleGenerate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Seller ID *</label>
                <input type="number" placeholder="e.g. 3" value={genForm.sellerId} onChange={e => setGenForm(f => ({ ...f, sellerId: e.target.value }))}
                  required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Period Start *</label>
                  <input type="date" value={genForm.periodStart} onChange={e => setGenForm(f => ({ ...f, periodStart: e.target.value }))}
                    required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Period End *</label>
                  <input type="date" value={genForm.periodEnd} onChange={e => setGenForm(f => ({ ...f, periodEnd: e.target.value }))}
                    required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>
                ℹ️ This will find all <strong>Delivered</strong> order items for the seller in the given period and generate a net payout after deducting commission.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setGenerateModal(false)} style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button type="submit" disabled={genLoading} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                  {genLoading ? 'Generating...' : 'Generate Payout'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PayoutsManagement;
