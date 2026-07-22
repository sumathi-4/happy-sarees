import React from 'react';
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
import styles from '../styles/AdminDashboard.module.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const statsData = [
    { title: 'Total Revenue', value: '₹12,45,230', trend: 'up', trendValue: '18.5% from last month', icon: <FiDollarSign />, colorTheme: 'pink' },
    { title: 'Total Orders', value: '1,245', trend: 'up', trendValue: '12.4% from last month', icon: <FiShoppingCart />, colorTheme: 'blue' },
    { title: 'Total Products', value: '856', trend: 'up', trendValue: '8.7% from last month', icon: <FiPackage />, colorTheme: 'green' },
    { title: 'Total Customers', value: '2,530', trend: 'up', trendValue: '15.3% from last month', icon: <FiUsers />, colorTheme: 'pink' },
    { title: 'Pending Orders', value: '67', trend: 'down', trendValue: '3.2% from last month', icon: <FiShoppingCart />, colorTheme: 'orange' },
    { 
      title: 'Low Stock Items', 
      value: '23', 
      trend: 'muted', 
      trendValue: 'Needs attention', 
      icon: <FiAlertTriangle />, 
      colorTheme: 'orange',
      actionLink: { label: 'View All', onClick: () => navigate('/products') } 
    }
  ];

  const recentOrders = [
    { id: '#ORD-1256', customer: 'Sneha Reddy', date: '21 Jul 2026', amount: '₹3,299', status: 'Delivered' },
    { id: '#ORD-1255', customer: 'Priya Sharma', date: '21 Jul 2026', amount: '₹2,899', status: 'Processing' },
    { id: '#ORD-1254', customer: 'Anjali Verma', date: '20 Jul 2026', amount: '₹1,999', status: 'Shipped' },
    { id: '#ORD-1253', customer: 'Meera Nair', date: '20 Jul 2026', amount: '₹4,599', status: 'Delivered' },
    { id: '#ORD-1252', customer: 'Kavya Iyer', date: '19 Jul 2026', amount: '₹2,499', status: 'Cancelled' }
  ];

  const topSellingProducts = [
    { id: 1, name: 'Peach Organza Printed Floral Saree', price: '₹2,189', sold: '245 Sold', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=100&q=80' },
    { id: 2, name: 'Lavender Soft Silk Festive Saree', price: '₹2,399', sold: '198 Sold', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Royal Magenta Kanchipuram Pure Silk Saree', price: '₹9,499', sold: '175 Sold', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80' },
    { id: 4, name: 'Emerald Green Banarasi Silk Saree', price: '₹3,299', sold: '142 Sold', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=100&q=80' },
    { id: 5, name: 'Ivory Gold Tissue Saree', price: '₹3,899', sold: '120 Sold', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80' }
  ];

  const lowStockProducts = [
    { id: 1, name: 'Mulmul Cotton Pastel Mint Saree', stock: '2 left', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80' },
    { id: 2, name: 'Chanderi Linen Zari Border Saree', stock: '4 left', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80' },
    { id: 3, name: 'Golden Zari Tissue Metallic Saree', stock: '3 left', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80' }
  ];

  const quickActions = [
    { label: 'Create Product', icon: <FiPlus />, onClick: () => navigate('/products') },
    { label: 'Manage Orders', icon: <FiShoppingCart />, onClick: () => navigate('/orders') },
    { label: 'Customers', icon: <FiUsers />, onClick: () => navigate('/customers') },
    { label: 'Marketing', icon: <FiShare2 />, onClick: () => navigate('/coupons') },
    { label: 'Reports', icon: <FiBarChart2 />, onClick: () => navigate('/reports') },
    { label: 'Settings', icon: <FiSettings />, onClick: () => navigate('/settings') }
  ];

  return (
    <div>
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

      <div className={styles.chartsGrid}>
        <ChartCard 
          title="Sales Overview" 
          type="line" 
          selectOptions={['This Month', 'Last Month', 'This Year']} 
        />
        <ChartCard 
          title="Order Status Overview" 
          type="donut" 
        />
      </div>

      <div className={styles.bottomSectionGrid}>
        <div className={styles.leftColumn}>
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
            <DataTable headers={['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'Action']}>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: '#d11b69' }}>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td style={{ fontWeight: 600 }}>{order.amount}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => alert(`Viewing details for order ${order.id}`)}
                      title="View Details"
                    >
                      <FiEye style={{ fontSize: '15px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </DashboardCard>

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
            {topSellingProducts.map((p) => (
              <div key={p.id} className={styles.productItem}>
                <div className={styles.productInfoLeft}>
                  <img src={p.image} alt={p.name} className={styles.productThumb} />
                  <div className={styles.productMeta}>
                    <span className={styles.productName} title={p.name}>{p.name}</span>
                    <span className={styles.productPrice}>{p.price}</span>
                  </div>
                </div>
                <span className={styles.productCountBadge}>{p.sold}</span>
              </div>
            ))}
          </DashboardCard>

          <DashboardCard title="Low Stock Products">
            {lowStockProducts.map((p) => (
              <div key={p.id} className={styles.productItem}>
                <div className={styles.productInfoLeft}>
                  <img src={p.image} alt={p.name} className={styles.productThumb} />
                  <div className={styles.productMeta}>
                    <span className={styles.productName} title={p.name}>{p.name}</span>
                    <span className={styles.productPrice} style={{ color: '#c62828', fontWeight: 600 }}>Only {p.stock}</span>
                  </div>
                </div>
                <span className={styles.stockBadge}>Restock</span>
              </div>
            ))}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
