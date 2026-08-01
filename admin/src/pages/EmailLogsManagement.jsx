import React, { useState, useEffect } from 'react';
import { FiMail, FiRefreshCw, FiCheckCircle, FiXCircle, FiSearch, FiInfo } from 'react-icons/fi';
import { emailLogsApi } from '../api/adminApi';

function EmailLogsManagement() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = () => {
    setLoading(true);
    emailLogsApi.getLogs()
      .then(d => {
        if (d.success && Array.isArray(d.logs)) {
          setLogs(d.logs);
        } else {
          setLogs([]);
        }
      })
      .catch(err => {
        console.error('Fetch Email Logs Error:', err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.order_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notification_type || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiMail style={{ color: 'var(--primary-color)' }} /> Transactional Email Logs
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Real-time backend email delivery monitoring and error logs from Neon PostgreSQL DB
          </p>
        </div>

        <button
          onClick={fetchLogs}
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
          <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh Logs
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-white)', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by customer email, order number, or event type..."
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
            <option value="All">All Statuses</option>
            <option value="Sent">Sent (Success)</option>
            <option value="Failed">Failed (Error)</option>
          </select>
        </div>

        <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 'auto', fontWeight: 600 }}>
          Showing {filteredOrdersCount(filteredLogs)} Logs
        </span>
      </div>

      {/* Logs Table Card */}
      <div style={{ background: 'var(--bg-white)', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {loading && logs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <FiRefreshCw style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '12px', color: 'var(--primary-color)' }} />
            <p>Fetching email logs from Neon PostgreSQL...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
            <FiMail style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 4px 0', color: '#334155' }}>No Email Logs Found</h4>
            <p style={{ margin: 0, fontSize: '13.5px' }}>No email notification dispatches matching search criteria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px' }}>Log ID</th>
                <th style={{ padding: '14px 18px' }}>Order Number</th>
                <th style={{ padding: '14px 18px' }}>Customer Email</th>
                <th style={{ padding: '14px 18px' }}>Notification Event</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Sent Timestamp</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#64748b' }}>#{log.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {log.order_number || `#${log.order_id}`}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>{log.customer_email}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>
                      {log.notification_type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {log.status === 'Sent' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                        <FiCheckCircle /> Sent
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                        <FiXCircle /> Failed
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12.5px' }}>
                    {new Date(log.sent_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {log.error_message && (
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        View Error
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Error Details Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: '14px', width: '90%', maxWidth: '520px', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#b91c1c', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiXCircle /> Email Failure Diagnostic Log
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px 0' }}>
              Order ID: #{selectedLog.order_id} | Type: {selectedLog.notification_type}
            </p>
            <div style={{ background: '#1e293b', color: '#f8fafc', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedLog.error_message || 'Unknown SMTP error'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: '#334155', color: 'var(--bg-white)', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function filteredOrdersCount(list) {
  return list.length;
}

export default EmailLogsManagement;
