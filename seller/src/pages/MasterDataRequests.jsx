import React, { useEffect, useState } from 'react';
import { sellerApi } from '../api/sellerApi';
import {
  FiPlusCircle, FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle
} from 'react-icons/fi';
import styles from '../styles/Orders.module.css';

const STATUS_BADGE = {
  pending:  { color: '#f59e0b', bg: '#fef3c7', label: 'Pending Review' },
  approved: { color: '#10b981', bg: '#d1fae5', label: 'Approved' },
  rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '3px 10px',
      borderRadius: '12px', fontSize: '12px', fontWeight: 600
    }}>
      {status === 'approved' ? <FiCheckCircle style={{ marginRight: 4 }} /> :
       status === 'rejected' ? <FiXCircle style={{ marginRight: 4 }} /> :
       <FiClock style={{ marginRight: 4 }} />}
      {s.label}
    </span>
  );
}

function MasterDataRequests() {
  const [requests, setRequests] = useState([]);
  const [masterTypes, setMasterTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    typeSlug: '',
    typeName: '',
    itemName: '',
    reason: ''
  });

  async function loadData() {
    setLoading(true);
    try {
      const [reqRes, typesRes] = await Promise.all([
        sellerApi.getMasterDataRequests(),
        fetch('http://localhost:5001/api/cms/spec-types').then(r => r.json())
      ]);
      if (reqRes.success) setRequests(reqRes.requests);
      if (typesRes.success && Array.isArray(typesRes.types)) setMasterTypes(typesRes.types);
    } catch (err) {
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const handleTypeChange = (e) => {
    const slug = e.target.value;
    const type = masterTypes.find(t => t.slug === slug);
    setForm(f => ({ ...f, typeSlug: slug, typeName: type ? type.name : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.typeSlug || !form.itemName.trim()) {
      setError('Please select a type and provide an item name.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await sellerApi.submitMasterDataRequest(form);
      setSuccess('Your request has been submitted for admin review.');
      setForm({ typeSlug: '', typeName: '', itemName: '', reason: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.detailCard} style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--text-color)' }}>
              Master Data Requests
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Request new attributes (fabric, color, pattern, etc.) to be added to the catalog.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={loadData}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
              style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              <FiPlusCircle size={15} />
              {showForm ? 'Cancel' : 'New Request'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <FiAlertCircle /> {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#d1fae5', color: '#10b981', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <FiCheckCircle /> {success}
          </div>
        )}

        {/* New Request Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--primary-color)', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', color: 'var(--text-color)' }}>
              Submit a New Attribute Request
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Attribute Type <span style={{ color: 'var(--primary-color)' }}>*</span>
                </label>
                <select
                  value={form.typeSlug}
                  onChange={handleTypeChange}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-color)', fontSize: '14px' }}
                >
                  <option value="">Select type...</option>
                  {masterTypes.map(t => (
                    <option key={t.id} value={t.slug}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  New Item Name <span style={{ color: 'var(--primary-color)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chanderi, Peacock Blue, Banarasi..."
                  value={form.itemName}
                  onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-color)', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Reason / Context (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this attribute is needed for your products..."
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-color)', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-muted)' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600 }}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <FiClock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No requests yet. Use the button above to request a new catalog attribute.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  {['Type', 'Requested Item', 'Reason', 'Status', 'Admin Note', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-color)' }}>{r.typeName}</td>
                    <td style={{ padding: '12px', color: 'var(--text-color)' }}>{r.itemName}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '200px' }}>{r.reason || '—'}</td>
                    <td style={{ padding: '12px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontStyle: r.adminNote ? 'normal' : 'italic' }}>{r.adminNote || '—'}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MasterDataRequests;
