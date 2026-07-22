import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  FiTrendingUp, FiShoppingBag, FiUsers, FiPackage, FiActivity, 
  FiRefreshCw, FiDownload, FiDollarSign, FiPercent, FiAlertCircle 
} from 'react-icons/fi';
import styles from '../styles/Reports.module.css';

// Mock Data
const SUMMARY_STATS = [
  { label: 'Revenue', value: '₹8,72,000', change: '+8% vs last month', isPositive: true, icon: <FiDollarSign /> },
  { label: 'Orders', value: '1,248', change: '+12% vs last month', isPositive: true, icon: <FiShoppingBag /> },
  { label: 'Customers', value: '542', change: '+5% vs last month', isPositive: true, icon: <FiUsers /> },
  { label: 'Products', value: '356 Sold', change: '+15% vs last month', isPositive: true, icon: <FiPackage /> },
  { label: 'Average Order Value', value: '₹2,450', change: '+2% vs last month', isPositive: true, icon: <FiActivity /> },
  { label: 'Conversion Rate', value: '2.4%', change: '+0.3% vs last month', isPositive: true, icon: <FiTrendingUp /> },
  { label: 'Refund Amount', value: '₹12,500', change: '-5% vs last month', isPositive: true, icon: <FiRefreshCw /> },
  { label: 'Total Coupons Used', value: '132', change: '+18% vs last month', isPositive: true, icon: <FiPercent /> }
];

const TOP_PRODUCTS = [
  { id: 1, name: 'Royal Silk Saree', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=80&q=80', sku: 'HS-SILK-001', orders: 162, revenue: '₹8,20,000', stock: 42 },
  { id: 2, name: 'Organza Floral Saree', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=80&q=80', sku: 'HS-ORG-002', orders: 148, revenue: '₹6,74,000', stock: 25 },
  { id: 3, name: 'Cotton Daily Wear Saree', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=80&q=80', sku: 'HS-COT-003', orders: 124, revenue: '₹3,18,000', stock: 56 },
  { id: 4, name: 'Tissue Gold Saree', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=80&q=80', sku: 'HS-TIS-004', orders: 92, revenue: '₹2,45,000', stock: 0 }
];

const RECENT_SALES = [
  { id: 'HS12345', customer: 'Sumathi A', amount: '₹6,999', payment: 'Paid', status: 'Delivered', time: 'Today 11:20 AM' },
  { id: 'HS12344', customer: 'Priya Sharma', amount: '₹2,199', payment: 'Paid', status: 'Processing', time: 'Today 10:15 AM' },
  { id: 'HS12343', customer: 'Anitha Iyer', amount: '₹4,299', payment: 'COD', status: 'Shipped', time: 'Yesterday' },
  { id: 'HS12342', customer: 'Kavya Reddy', amount: '₹1,499', payment: 'Failed', status: 'Cancelled', time: '2 days ago' }
];

const FABRICS = [
  { name: 'Silk', percentage: 85, color: '#d11b69' },
  { name: 'Organza', percentage: 65, color: '#e040fb' },
  { name: 'Cotton', percentage: 45, color: '#00e5ff' },
  { name: 'Tissue', percentage: 35, color: '#ffc107' }
];

const OCCASIONS = [
  { name: 'Bridal', percentage: 75, color: '#d11b69' },
  { name: 'Festive', percentage: 60, color: '#ab47bc' },
  { name: 'Casual', percentage: 40, color: '#26c6da' },
  { name: 'Party', percentage: 30, color: '#ffca28' }
];

function Reports() {
  const location = useLocation();
  const subpath = location.pathname.split('/').pop();

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Determine active tab component
  const getActiveTab = () => {
    if (subpath === 'sales') return <SalesReportView />;
    if (subpath === 'products') return <ProductsReportView />;
    if (subpath === 'customers') return <CustomersReportView />;
    if (subpath === 'orders') return <OrdersReportView />;
    return <OverviewReportView />;
  };

  return (
    <div className={styles.wrapper}>
      {toastMsg && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMsg}
        </div>
      )}

      {/* Header parameters */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reports & Analytics</h2>
          <p className={styles.desc}>Analyze your business trends, transactions, and inventory performance</p>
        </div>
        <button 
          className={styles.pdfExportBtn} 
          onClick={() => {
            const headers = ['Metric Label', 'Value', 'Change'];
            const rows = SUMMARY_STATS.map(s => [
              `"${s.label}"`,
              `"${s.value}"`,
              `"${s.change}"`
            ]);
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_summary_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            triggerToast("Analytics summary report exported successfully!");
          }}
        >
          <FiDownload style={{ marginRight: '6px' }} /> Export Report CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Date Range:</span>
          <select value={dateRange} onChange={(e) => { setDateRange(e.target.value); triggerToast(`Period filter updated: ${e.target.value}`); }} className={styles.selectFilter}>
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          
          <select className={styles.selectFilter} onChange={() => triggerToast("Comparison frame updated.")}>
            <option>Compare: Previous Period</option>
            <option>Compare: Previous Year</option>
            <option>No Comparison</option>
          </select>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.refreshBtn} onClick={() => triggerToast("Reports dashboard refreshed.")} title="Refresh Data">
            <FiRefreshCw /> Refresh
          </button>
          <button className={styles.exportBtn} onClick={() => triggerToast("Exporting Excel transaction sheet...")}>
            <FiDownload /> Export Excel
          </button>
        </div>
      </div>

      {/* Subpage tabs navigation */}
      <div className={styles.tabsRow}>
        <Link to="/reports" className={`${styles.tab} ${(!subpath || subpath === 'reports') ? styles.tabActive : ''}`}>
          Overview
        </Link>
        <Link to="/reports/sales" className={`${styles.tab} ${subpath === 'sales' ? styles.tabActive : ''}`}>
          Sales Report
        </Link>
        <Link to="/reports/products" className={`${styles.tab} ${subpath === 'products' ? styles.tabActive : ''}`}>
          Products Report
        </Link>
        <Link to="/reports/customers" className={`${styles.tab} ${subpath === 'customers' ? styles.tabActive : ''}`}>
          Customers Report
        </Link>
        <Link to="/reports/orders" className={`${styles.tab} ${subpath === 'orders' ? styles.tabActive : ''}`}>
          Orders Report
        </Link>
      </div>

      {/* Render active subpage tab */}
      <div className={styles.tabContentArea}>
        {getActiveTab()}
      </div>
    </div>
  );
}

// SUBVIEWS IMPLEMENTATION

// 1. Overview Analytics view
function OverviewReportView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 8 Stats KPI cards */}
      <div className={styles.statsGrid}>
        {SUMMARY_STATS.map((stat, i) => (
          <div key={i} className={styles.statsCard}>
            <div className={styles.cardHeaderSlot}>
              <span className={styles.cardLabel}>{stat.label}</span>
              <span className={styles.cardIcon}>{stat.icon}</span>
            </div>
            <strong className={styles.cardValue}>{stat.value}</strong>
            <span className={styles.cardTrendUp}>{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Sales Trend Chart panel */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <h3>Monthly Revenue Progression</h3>
        </div>
        <div className={styles.chartWrapper}>
          <div className={styles.chartLegend}>
            <span className={styles.legendItem}><span style={{ backgroundColor: '#d11b69' }} /> Monthly Revenue</span>
          </div>
          {/* Custom SVG line chart representing Jan to Jun */}
          <svg className={styles.svgLineChart} viewBox="0 0 600 220">
            {/* Grid Lines */}
            <line x1="40" y1="20" x2="580" y2="20" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="40" y1="70" x2="580" y2="70" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="40" y1="120" x2="580" y2="120" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="40" y1="170" x2="580" y2="170" stroke="#e0e0e0" strokeWidth="1.5" />
            
            {/* Y axis labels */}
            <text x="10" y="24" className={styles.svgText}>10L</text>
            <text x="10" y="74" className={styles.svgText}>5L</text>
            <text x="10" y="124" className={styles.svgText}>2L</text>
            <text x="10" y="174" className={styles.svgText}>0</text>

            {/* X axis labels */}
            <text x="50" y="195" className={styles.svgText}>Jan</text>
            <text x="140" y="195" className={styles.svgText}>Feb</text>
            <text x="230" y="195" className={styles.svgText}>Mar</text>
            <text x="320" y="195" className={styles.svgText}>Apr</text>
            <text x="410" y="195" className={styles.svgText}>May</text>
            <text x="500" y="195" className={styles.svgText}>Jun</text>

            {/* SVG line path mapping revenue peaks */}
            <path 
              d="M 50 170 Q 140 120 230 140 T 320 80 T 410 90 T 500 40" 
              fill="none" 
              stroke="#d11b69" 
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Points */}
            <circle cx="50" cy="170" r="5" fill="#d11b69" />
            <circle cx="140" cy="120" r="5" fill="#d11b69" />
            <circle cx="230" cy="140" r="5" fill="#d11b69" />
            <circle cx="320" cy="80" r="5" fill="#d11b69" />
            <circle cx="410" cy="90" r="5" fill="#d11b69" />
            <circle cx="500" cy="40" r="5" fill="#d11b69" />
          </svg>
        </div>
      </div>

      {/* Doughnut distribution split and Fabric bars */}
      <div className={styles.splitRow}>
        <div className={styles.panelCard} style={{ flex: 1.2 }}>
          <div className={styles.panelHeader}>
            <h3>Top Selling Fabrics</h3>
          </div>
          <div className={styles.barsList}>
            {FABRICS.map((fab, i) => (
              <div key={i} className={styles.barItem}>
                <div className={styles.barLabelRow}>
                  <strong>{fab.name}</strong>
                  <span>{fab.percentage}% of sales</span>
                </div>
                <div className={styles.barBackground}>
                  <div className={styles.barFill} style={{ width: `${fab.percentage}%`, backgroundColor: fab.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.panelHeader}>
            <h3>Top Selling Occasions</h3>
          </div>
          <div className={styles.barsList}>
            {OCCASIONS.map((occ, i) => (
              <div key={i} className={styles.barItem}>
                <div className={styles.barLabelRow}>
                  <strong>{occ.name}</strong>
                  <span>{occ.percentage}% share</span>
                </div>
                <div className={styles.barBackground}>
                  <div className={styles.barFill} style={{ width: `${occ.percentage}%`, backgroundColor: occ.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Widgets row */}
      <div className={styles.widgetsGrid}>
        <div className={styles.widgetCard}>
          <h5>Out of Stock Items</h5>
          <div className={styles.widgetItemRow}>
            <strong>Tissue Gold Saree</strong>
            <span className={styles.statusBadgeRed}>0 left</span>
          </div>
        </div>
        <div className={styles.widgetCard}>
          <h5>Top customer</h5>
          <div className={styles.widgetItemRow}>
            <strong>Sumathi A</strong>
            <strong>₹18,450 spent</strong>
          </div>
        </div>
        <div className={styles.widgetCard}>
          <h5>Best coupon</h5>
          <div className={styles.widgetItemRow}>
            <strong>HAPPY10</strong>
            <span>82 claims</span>
          </div>
        </div>
        <div className={styles.widgetCard}>
          <h5>Most wishlisted</h5>
          <div className={styles.widgetItemRow}>
            <strong>Banarasi Silk</strong>
            <span>280 wishlists</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// 2. Sales Report view
function SalesReportView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Revenue bar chart */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <h3>Revenue by Month (Bar Chart)</h3>
        </div>
        <div className={styles.barChartContainer}>
          {/* Custom SVG bars representation */}
          <svg className={styles.svgBarChart} viewBox="0 0 600 200">
            <line x1="40" y1="160" x2="580" y2="160" stroke="#cccccc" strokeWidth="1.5" />
            {/* Monthly bars */}
            <rect x="60" y="70" width="30" height="90" rx="3" fill="#d11b69" />
            <rect x="150" y="90" width="30" height="70" rx="3" fill="#d11b69" />
            <rect x="240" y="50" width="30" height="110" rx="3" fill="#d11b69" />
            <rect x="330" y="40" width="30" height="120" rx="3" fill="#d11b69" />
            <rect x="420" y="80" width="30" height="80" rx="3" fill="#d11b69" />
            <rect x="510" y="30" width="30" height="130" rx="3" fill="#d11b69" />
            
            <text x="65" y="180" className={styles.svgText}>Jan</text>
            <text x="155" y="180" className={styles.svgText}>Feb</text>
            <text x="245" y="180" className={styles.svgText}>Mar</text>
            <text x="335" y="180" className={styles.svgText}>Apr</text>
            <text x="425" y="180" className={styles.svgText}>May</text>
            <text x="515" y="180" className={styles.svgText}>Jun</text>
          </svg>
        </div>
      </div>

      {/* Recent sales Activity block */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <h3>Recent Sales Activity</h3>
        </div>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_SALES.map((sale, i) => (
                <tr key={i}>
                  <td><strong style={{ color: '#d11b69' }}>{sale.id}</strong></td>
                  <td>{sale.customer}</td>
                  <td><strong>{sale.amount}</strong></td>
                  <td>
                    <span className={`${styles.badge} ${sale.payment === 'Paid' ? styles.badgePaid : styles.badgePending}`}>
                      {sale.payment}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.badge} ${sale.status === 'Delivered' ? styles.badgeDelivered : styles.badgeProcessing}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td>{sale.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// 3. Products Report view
function ProductsReportView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <h3>Top Selling Products</h3>
        </div>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Stock Remaining</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((prod) => (
                <tr key={prod.id}>
                  <td>
                    <img src={prod.image} alt={prod.name} className={styles.prodImg} />
                  </td>
                  <td><strong>{prod.name}</strong></td>
                  <td>{prod.sku}</td>
                  <td>{prod.orders}</td>
                  <td><strong>{prod.revenue}</strong></td>
                  <td>
                    <span className={prod.stock === 0 ? styles.stockOut : styles.stockIn}>
                      {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} items`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// 4. Customers Report view
function CustomersReportView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <h3>Customer Retention & Spending Profile</h3>
        </div>
        <div className={styles.customerGrid}>
          <div className={styles.statBox}>
            <span>Active Customers ratio</span>
            <strong>92%</strong>
          </div>
          <div className={styles.statBox}>
            <span>Average Spending / Customer</span>
            <strong>₹3,450</strong>
          </div>
          <div className={styles.statBox}>
            <span>Repeat Purchase Rate</span>
            <strong>48%</strong>
          </div>
        </div>

        <div className={styles.tableResponsive} style={{ marginTop: '20px' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Loyalty Tier</th>
                <th>Lifetime Orders</th>
                <th>Spent Overall</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sumathi A</td>
                <td>sumathi@mail.com</td>
                <td><span className={styles.tierGold}>VIP Gold</span></td>
                <td>12</td>
                <td><strong>₹18,450</strong></td>
              </tr>
              <tr>
                <td>Anitha Iyer</td>
                <td>anitha@mail.com</td>
                <td><span className={styles.tierGold}>VIP Gold</span></td>
                <td>18</td>
                <td><strong>₹32,890</strong></td>
              </tr>
              <tr>
                <td>Priya Sharma</td>
                <td>priya@mail.com</td>
                <td><span className={styles.tierSilver}>Silver</span></td>
                <td>8</td>
                <td><strong>₹9,230</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// 5. Orders Report view
function OrdersReportView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className={styles.splitRow}>
        
        {/* Doughnut breakdown */}
        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.panelHeader}>
            <h3>OrderStatus Distribution</h3>
          </div>
          <div className={styles.doughnutWrapper}>
            {/* Custom visual representation */}
            <div className={styles.circleGraph}>
              <div className={styles.centerHole}>
                <strong>1,248</strong>
                <span>Total Orders</span>
              </div>
            </div>
            
            <div className={styles.doughnutLegend}>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#2e7d32' }} /> Delivered (45%)</div>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#1565c0' }} /> Shipped (20%)</div>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#ff8f00' }} /> Processing (15%)</div>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#c62828' }} /> Cancelled (10%)</div>
            </div>
          </div>
        </div>

        {/* Pie payment split */}
        <div className={styles.panelCard} style={{ flex: 1 }}>
          <div className={styles.panelHeader}>
            <h3>Payment Method Splits</h3>
          </div>
          <div className={styles.doughnutWrapper}>
            <div className={styles.circleGraph} style={{ background: 'conic-gradient(#d11b69 0% 55%, #ab47bc 55% 85%, #ffca28 85% 100%)' }}>
              <div className={styles.centerHole}>
                <strong>100%</strong>
                <span>Transactions</span>
              </div>
            </div>

            <div className={styles.doughnutLegend}>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#d11b69' }} /> Razorpay (55%)</div>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#ab47bc' }} /> COD (30%)</div>
              <div className={styles.legendRow}><span style={{ backgroundColor: '#ffca28' }} /> UPI / Bank (15%)</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Reports;
