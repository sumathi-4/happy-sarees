import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiDollarSign, FiShoppingCart, FiPackage, FiUsers, 
  FiAlertTriangle, FiEye, FiPlus, FiGrid, FiFileText, 
  FiSettings, FiShare2, FiBarChart2, FiAward, FiEdit3
} from 'react-icons/fi';
import StatCard from '../components/StatCard';
import DashboardCard from '../components/DashboardCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ChartCard from '../components/ChartCard';
import QuickActionCard from '../components/QuickActionCard';
import { dashboardApi } from '../api/adminApi';
import styles from '../styles/AdminDashboard.module.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  const [salesGraph, setSalesGraph] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      dashboardApi.getStats().catch(() => null),
      dashboardApi.getSalesGraph().catch(() => null),
      dashboardApi.getOrderStatus().catch(() => null),
      dashboardApi.getRecentOrders().catch(() => null),
      dashboardApi.getTopSelling().catch(() => null),
      dashboardApi.getLowStock().catch(() => null)
    ]).then(([statsRes, salesRes, statusRes, ordersRes, topSellingRes, lowStockRes]) => {
      if (!isMounted) return;

      if (statsRes && statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (salesRes && salesRes.success && salesRes.data) {
        setSalesGraph(salesRes.data);
      }
      if (statusRes && statusRes.success && statusRes.data) {
        setOrderStatus(statusRes.data);
      }
      if (ordersRes && ordersRes.success && ordersRes.orders) {
        setRecentOrders(ordersRes.orders);
      }
      if (topSellingRes && topSellingRes.success && topSellingRes.products) {
        setTopSellingProducts(topSellingRes.products);
      }
      if (lowStockRes && lowStockRes.success && lowStockRes.products) {
        setLowStockProducts(lowStockRes.products);
      }
    }).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const statsData = [
    { 
      title: 'Total Revenue', 
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, 
      trend: 'up', 
      trendValue: 'Live from DB', 
      icon: <FiDollarSign />, 
      colorTheme: 'pink' 
    },
    { 
      title: 'Total Orders', 
      value: Number(stats.totalOrders || 0).toLocaleString('en-IN'), 
      trend: 'up', 
      trendValue: 'Live from DB', 
      icon: <FiShoppingCart />, 
      colorTheme: 'blue' 
    },
    { 
      title: 'Total Products', 
      value: Number(stats.totalProducts || 0).toLocaleString('en-IN'), 
      trend: 'up', 
      trendValue: 'Active catalog', 
      icon: <FiPackage />, 
      colorTheme: 'green' 
    },
    { 
      title: 'Total Customers', 
      value: Number(stats.totalCustomers || 0).toLocaleString('en-IN'), 
      trend: 'up', 
      trendValue: 'Registered users', 
      icon: <FiUsers />, 
      colorTheme: 'pink' 
    },
    { 
      title: 'Pending Orders', 
      value: Number(stats.pendingOrders || 0).toLocaleString('en-IN'), 
      trend: stats.pendingOrders > 0 ? 'up' : 'muted', 
      trendValue: stats.pendingOrders > 0 ? 'Requires fulfillment' : 'All clear', 
      icon: <FiShoppingCart />, 
      colorTheme: 'orange' 
    },
    { 
      title: 'Low Stock Items', 
      value: lowStockProducts.length.toLocaleString('en-IN'), 
      trend: lowStockProducts.length > 0 ? 'down' : 'muted', 
      trendValue: lowStockProducts.length > 0 ? 'Needs attention' : 'Sufficient inventory', 
      icon: <FiAlertTriangle />, 
      colorTheme: 'orange',
      actionLink: { label: 'View All', onClick: () => navigate('/products') } 
    }
  ];

  const quickActions = [
    { label: 'Create Product', icon: <FiPlus />, onClick: () => navigate('/products') },
    { label: 'Manage Orders', icon: <FiShoppingCart />, onClick: () => navigate('/orders') },
    { label: 'Customers', icon: <FiUsers />, onClick: () => navigate('/customers') },
    { label: 'Marketing', icon: <FiShare2 />, onClick: () => navigate('/coupons') },
    { label: 'Reports', icon: <FiBarChart2 />, onClick: () => navigate('/reports') },
    { label: 'Settings', icon: <FiSettings />, onClick: () => navigate('/settings') }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return String(dateStr);
    }
  };

  return (
    <div>
      {/* Dynamic Summary Stat Cards */}
      <div className={styles.statsGrid}>
        {statsData.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            trendValue={stat.trendValue}
            icon={stat.icon}
            colorTheme={stat.colorTheme}
            actionLink={stat.actionLink}
          />
        ))}
      </div>

      {/* Dynamic Charts Grid */}
      <div className={styles.chartsGrid}>
        <ChartCard 
          title="Sales Overview" 
          type="line" 
          selectOptions={['This Month', 'Last Month', 'This Year']} 
          salesData={salesGraph}
        />
        <ChartCard 
          title="Order Status Overview" 
          type="donut" 
          statusData={orderStatus}
        />
      </div>

      {/* Dynamic Bottom Section */}
      <div className={styles.bottomSectionGrid}>
        <div className={styles.leftColumn}>
          {/* Dynamic Recent Orders Table */}
          <DashboardCard 
            title="Recent Orders" 
            headerAction={
              <button 
                onClick={() => navigate('/orders')}
                style={{
                  background: 'none', border: 'none', color: '#d11b69', 
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                View All
              </button>
            }
          >
            {recentOrders.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No recent orders found in the system.
              </div>
            ) : (
              <DataTable headers={['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Action']}>
                {recentOrders.map((order, index) => (
                  <tr key={order.id || index}>
                    <td style={{ fontWeight: 600, color: '#d11b69' }}>
                      {order.orderNumber || `#ORD-${order.id}`}
                    </td>
                    <td>{order.customer || 'Customer'}</td>
                    <td>{formatDate(order.date)}</td>
                    <td style={{ fontWeight: 600 }}>
                      ₹{Number(order.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => navigate('/orders')}
                        title="View Order Details"
                      >
                        <FiEye style={{ fontSize: '15px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </DashboardCard>

          {/* Quick Actions */}
          <DashboardCard title="Quick Actions">
            <div className={styles.quickActionsRow}>
              {quickActions.map((action, i) => (
                <QuickActionCard
                  key={i}
                  label={action.label}
                  icon={action.icon}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className={styles.rightColumn}>
          {/* Dynamic Top Selling Products */}
          <DashboardCard 
            title="Top Selling Products"
            headerAction={
              <button 
                onClick={() => navigate('/products')}
                style={{
                  background: 'none', border: 'none', color: '#d11b69', 
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                View All
              </button>
            }
          >
            {topSellingProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No products found.
              </div>
            ) : (
              topSellingProducts.map((p) => (
                <div key={p.id} className={styles.productItem}>
                  <div className={styles.productInfoLeft}>
                    <img 
                      src={p.image || '/src/assets/hero_saree_model.png'} 
                      alt={p.name} 
                      className={styles.productThumb} 
                      onError={(e) => { e.target.src = '/src/assets/hero_saree_model.png'; }}
                    />
                    <div className={styles.productMeta}>
                      <span className={styles.productName} title={p.name}>{p.name}</span>
                      <span className={styles.productPrice}>₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className={styles.productCountBadge}>{p.sold} Sold</span>
                </div>
              ))
            )}
          </DashboardCard>

          {/* Dynamic Low Stock Products */}
          <DashboardCard title="Low Stock Products">
            {lowStockProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
                ✓ All products have healthy inventory!
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className={styles.productItem}>
                  <div className={styles.productInfoLeft}>
                    <img 
                      src={p.image || '/src/assets/hero_saree_model.png'} 
                      alt={p.name} 
                      className={styles.productThumb} 
                      onError={(e) => { e.target.src = '/src/assets/hero_saree_model.png'; }}
                    />
                    <div className={styles.productMeta}>
                      <span className={styles.productName} title={p.name}>{p.name}</span>
                      <span className={styles.productPrice} style={{ color: '#c62828', fontWeight: 600 }}>
                        Only {p.stockCount} left
                      </span>
                    </div>
                  </div>
                  <button 
                    className={styles.stockBadge}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => navigate('/products')}
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
