import React, { useEffect, useState } from 'react';
import { sellerApi } from '../api/sellerApi';
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import styles from '../styles/Dashboard.module.css';

function Analytics() {
  const [salesData, setSalesData] = useState([]);
  const [bestProduct, setBestProduct] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [salesRes, payoutsRes] = await Promise.all([
          sellerApi.getSalesAnalytics(),
          sellerApi.getPayoutsAnalytics()
        ]);

        if (salesRes.success) {
          setSalesData(salesRes.trend);
          setBestProduct(salesRes.bestProduct);
        }
        if (payoutsRes.success) {
          setPayouts(payoutsRes.payouts);
        }
      } catch (err) {
        setError(err.message || 'An error occurred loading analytics.');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-IN');
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading analytics charts...</div>;
  if (error) return <div style={{ padding: '20px', color: 'var(--error-color)' }}>{error}</div>;

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.welcomeSection}>
        <span className={styles.eyebrow}>YOUR REPORTS</span>
        <h1 className={styles.title}>Atelier Analytics</h1>
        <p className={styles.subtitle}>Deep dive into sales trends, order volumes, and financial payouts history.</p>
      </div>

      {/* Grid of chart graphs */}
      <div className={styles.middleLayout}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Revenue Generated</h3>
            <span className={styles.eyebrow}>LAST 14 DAYS</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f6e1e8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-white)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: 12 }}
                  formatter={(value) => [`₹${formatPrice(value)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Order Frequency</h3>
            <span className={styles.eyebrow}>DAILY QUANTITY</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f6e1e8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-white)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: 12 }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar dataKey="orders" fill="var(--gold-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payouts list */}
      <div className={styles.payoutsCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Weaver Settlement & Bank Ledger</h3>
          <span className={styles.eyebrow}>PAYOUT LEDGER</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Payout Ledger ID</th>
                <th className={styles.th}>Payout Amount</th>
                <th className={styles.th}>Start Period</th>
                <th className={styles.th}>End Period</th>
                <th className={styles.th}>Settled Date</th>
                <th className={styles.th}>Fulfillment Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.td} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                    No bank payout transactions verified.
                  </td>
                </tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td}>HS-PAY-{p.id}</td>
                    <td className={styles.td} style={{ fontWeight: 700, color: 'var(--gold-color)' }}>₹{formatPrice(p.amount)}</td>
                    <td className={styles.td}>{new Date(p.periodStart).toLocaleDateString()}</td>
                    <td className={styles.td}>{new Date(p.periodEnd).toLocaleDateString()}</td>
                    <td className={styles.td}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Processing'}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${
                        p.status === 'paid' ? styles.statusPaid : (p.status === 'pending' ? styles.statusPending : styles.statusFailed)
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
