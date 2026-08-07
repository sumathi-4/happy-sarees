import React, { useEffect, useState } from 'react';
import { useSellerAuth } from '../context/SellerAuthContext';
import { sellerApi } from '../api/sellerApi';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  FiShoppingBag, FiDollarSign, FiClock, FiCheck, FiX, FiAward 
} from 'react-icons/fi';
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  const { sellerUser } = useSellerAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await sellerApi.getDashboardSummary();
        if (res.success) {
          setData(res.summary);
        } else {
          setError('Failed to load dashboard data.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const formatPrice = (val) => {
    return Number(val).toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
        <div style={{ height: '40px', width: '200px', backgroundColor: 'var(--border-color)', borderRadius: '6px', className: 'skeleton' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: '120px', backgroundColor: 'var(--border-color)', borderRadius: '16px' }} />
          ))}
        </div>
        <div style={{ height: '300px', backgroundColor: 'var(--border-color)', borderRadius: '16px' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'var(--error-color)', background: 'var(--error-bg)', borderRadius: '8px' }}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      {/* Welcome Block */}
      <div className={styles.welcomeSection}>
        <span className={styles.eyebrow}>YOUR ATELIER</span>
        <h1 className={styles.title}>Namaste, {sellerUser?.ownerName || 'Weaver'}</h1>
        <p className={styles.subtitle}>Here is a summary of your boutique's performance and recent weaver orders.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Today's Revenue</div>
          <div className={`${styles.kpiValue} ${styles.kpiValueGold}`}>₹{formatPrice(data.todayRevenue)}</div>
          <div className={styles.kpiMeta}>Settled into payouts</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Today's Orders</div>
          <div className={styles.kpiValue}>{data.todayOrders}</div>
          <div className={styles.kpiMeta}>Items ordered today</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Pending Fulfilment</div>
          <div className={styles.kpiValue} style={{ color: 'var(--warning-color)' }}>{data.pendingOrders}</div>
          <div className={styles.kpiMeta}>Awaiting shipment packaging</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Delivered Items</div>
          <div className={styles.kpiValue} style={{ color: 'var(--success-color)' }}>{data.deliveredOrders}</div>
          <div className={styles.kpiMeta}>Delivered to customers</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Revenue</div>
          <div className={`${styles.kpiValue} ${styles.kpiValueGold}`}>₹{formatPrice(data.totalRevenue)}</div>
          <div className={styles.kpiMeta}>Total net sales</div>
        </div>
      </div>

      {/* Sales graph & Best Selling Product */}
      <div className={styles.middleLayout}>
        
        {/* Trend AreaChart */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>14-Day Sales Trend</h3>
            <span className={styles.eyebrow}>THIS FORTNIGHT</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  formatter={(value, name) => [name === 'revenue' ? `₹${formatPrice(value)}` : value, name.toUpperCase()]}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary-color)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Selling Product */}
        <div className={styles.bestSellerCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Top Selling Saree</h3>
            <FiAward style={{ color: 'var(--gold-color)', fontSize: '20px' }} />
          </div>

          {data.bestProduct ? (
            <div className={styles.bestProductDetails}>
              <img src={data.bestProduct.image} alt={data.bestProduct.name} className={styles.productImg} />
              <div>
                <h4 className={styles.productName}>{data.bestProduct.name}</h4>
                <span className={styles.productSku}>SKU: {data.bestProduct.sku}</span>
              </div>
              <div className={styles.productSales}>
                <div className={styles.salesStat}>
                  <span>Units Sold</span>
                  <span className={styles.salesStatVal}>{data.bestProduct.unitsSold}</span>
                </div>
                <div className={styles.salesStat}>
                  <span>Revenue Generated</span>
                  <span className={styles.salesStatVal} style={{ color: 'var(--gold-color)' }}>₹{formatPrice(data.bestProduct.revenue)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noBestProduct}>
              No sales recorded yet. Once orders ship, your best weavers will appear here!
            </div>
          )}
        </div>
      </div>

      {/* Payouts list */}
      <div className={styles.payoutsCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Settlements & Payouts</h3>
          <span className={styles.eyebrow}>PAYOUT HISTORY</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Payout ID</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Period</th>
                <th className={styles.th}>Date Initiated</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.payouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.td} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px' }}>
                    No payout history recorded yet. Settlement runs automatically every week.
                  </td>
                </tr>
              ) : (
                data.payouts.map(p => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td}>HS-PAY-{p.id}</td>
                    <td className={styles.td} style={{ fontWeight: 700, color: 'var(--gold-color)' }}>₹{formatPrice(p.amount)}</td>
                    <td className={styles.td}>
                      {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
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

export default Dashboard;
