import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import styles from '../styles/PayoutsManagement.module.css';

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
  const cls = status === 'paid' ? styles.badgePaid
             : status === 'processing' ? styles.badgeProcessing
             : status === 'failed' ? styles.badgeFailed
             : styles.badgePending;
  const label = status === 'paid' ? 'Paid'
              : status === 'processing' ? 'Processing'
              : status === 'failed' ? 'Failed'
              : 'Pending';
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Payouts Management</h1>
          <p className={styles.desc}>Generate, review and process seller payouts.</p>
        </div>
        <button
          onClick={() => setGenerateModal(true)}
          className={styles.generateBtn}
        >
          <FiDollarSign /> Generate Payout
        </button>
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

      {/* Summary KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCardPending}`}>
          <div className={styles.kpiLabel}>⏳ Total Pending</div>
          <div className={styles.kpiValue}>₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardPaid}`}>
          <div className={styles.kpiLabel}>✅ Total Paid Out</div>
          <div className={styles.kpiValue}>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCardTotal}`}>
          <div className={styles.kpiLabel}>📋 Total Records</div>
          <div className={styles.kpiValue}>{payouts.length}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {['all', 'pending', 'processing', 'paid', 'failed'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button
          onClick={loadPayouts}
          className={styles.refreshBtn}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className={styles.empty}>
            <FiClock size={36} className={styles.emptyIcon} />
            <p>No payouts found for this filter.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Seller</th>
                  <th className={styles.th}>Period</th>
                  <th className={`${styles.th} ${styles.alignRight}`}>Amount (Net)</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Paid On</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.payoutId}`}>#{p.id}</td>
                    <td className={styles.td}>
                      <div className={styles.sellerStore}>{p.storeName}</div>
                      <div className={styles.sellerEmail}>{p.sellerEmail}</div>
                    </td>
                    <td className={`${styles.td} ${styles.periodText}`}>
                      {p.periodStart ? `${new Date(p.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(p.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}` : '—'}
                    </td>
                    <td className={`${styles.td} ${styles.alignRight} ${styles.amountText} ${p.amount < 0 ? styles.amountNegative : styles.amountPositive}`}>
                      {p.amount < 0 ? '−' : ''}₹{Math.abs(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={styles.td}><Badge status={p.status} /></td>
                    <td className={`${styles.td} ${styles.dateText}`}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className={styles.td}>
                      {p.status === 'pending' || p.status === 'processing' ? (
                        <button
                          onClick={() => handleMarkPaid(p.id)}
                          disabled={actionLoading === p.id}
                          className={styles.markPaidBtn}
                        >
                          <FiCheckCircle size={13} /> {actionLoading === p.id ? 'Processing...' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span className={styles.actionNote}>—</span>
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
          <div className={styles.modalOverlay} onClick={() => setGenerateModal(false)} />
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Generate Seller Payout</h3>
            <form onSubmit={handleGenerate}>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalFormLabel}>Seller ID *</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  value={genForm.sellerId}
                  onChange={e => setGenForm(f => ({ ...f, sellerId: e.target.value }))}
                  required
                  className={styles.modalFormInput}
                />
              </div>
              <div className={styles.modalFormRow}>
                <div>
                  <label className={styles.modalFormLabel}>Period Start *</label>
                  <input
                    type="date"
                    value={genForm.periodStart}
                    onChange={e => setGenForm(f => ({ ...f, periodStart: e.target.value }))}
                    required
                    className={styles.modalFormInput}
                  />
                </div>
                <div>
                  <label className={styles.modalFormLabel}>Period End *</label>
                  <input
                    type="date"
                    value={genForm.periodEnd}
                    onChange={e => setGenForm(f => ({ ...f, periodEnd: e.target.value }))}
                    required
                    className={styles.modalFormInput}
                  />
                </div>
              </div>
              <p className={styles.modalHelpText}>
                ℹ️ This will find all <strong>Delivered</strong> order items for the seller in the given period and generate a net payout after deducting commission.
              </p>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setGenerateModal(false)} className={styles.modalCancelBtn}>Cancel</button>
                <button type="submit" disabled={genLoading} className={styles.modalConfirmBtn}>
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
