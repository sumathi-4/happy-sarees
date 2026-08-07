import React, { useEffect, useState } from 'react';
import { sellerApi } from '../api/sellerApi';
import { FiDollarSign, FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';
import styles from '../styles/Orders.module.css';

const STATUS_BADGE = {
  pending:    { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  processing: { color: '#3b82f6', bg: '#dbeafe', label: 'Processing' },
  paid:       { color: '#10b981', bg: '#d1fae5', label: 'Paid' },
  failed:     { color: '#ef4444', bg: '#fee2e2', label: 'Failed' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadPayouts() {
    setLoading(true);
    setError('');
    try {
      const res = await sellerApi.getPayouts();
      if (res.success) setPayouts(res.payouts);
    } catch (err) {
      setError(err.message || 'Failed to load payouts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayouts(); }, []);

  // Compute totals
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.detailCard} style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--text-color)' }}>
              Payout History
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Your earnings and commission statements from Happy Sarees.
            </p>
          </div>
          <button
            onClick={loadPayouts}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.85, fontSize: '13px' }}>
              <FiCheckCircle /> Total Paid Out
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700 }}>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.85, fontSize: '13px' }}>
              <FiClock /> Pending / Processing
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700 }}>₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-color, #7c3aed) 0%, #5b21b6 100%)', borderRadius: '12px', padding: '20px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.85, fontSize: '13px' }}>
              <FiTrendingUp /> Total Payouts
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700 }}>{payouts.length}</div>
          </div>
        </div>

        {/* Payouts Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading payouts...</div>
        ) : payouts.length === 0 ? (
          <div className={styles.emptyState}>
            <FiDollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No payouts yet. Payouts are generated by admin after your delivered orders are verified.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['Payout #', 'Period', 'Items', 'Gross Amount', 'Commission', 'Net Payout', 'Status', 'Paid On'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-color)' }}>#{p.id}</td>
                    <td style={{ padding: '12px', color: 'var(--text-color)', whiteSpace: 'nowrap' }}>
                      {p.periodStart ? `${new Date(p.periodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(p.periodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}` : '—'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{p.itemCount || '—'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-color)' }}>
                      {p.grossAmount != null ? `₹${Number(p.grossAmount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '12px', color: '#ef4444' }}>
                      {p.commission != null ? `−₹${Number(p.commission).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#10b981' }}>
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px' }}><StatusBadge status={p.status} /></td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footnote */}
        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          ℹ️ Payouts are generated periodically by the Happy Sarees admin team based on your delivered orders. Commission is deducted as per your seller agreement.
        </p>
      </div>
    </div>
  );
}

export default Payouts;
