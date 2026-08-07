import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Orders.module.css';

const TABS = [
  { id: '', label: 'All Orders' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Processing', label: 'Processing' },
  { id: 'Shipped', label: 'Shipped' },
  { id: 'Delivered', label: 'Delivered' },
  { id: 'Cancelled', label: 'Cancelled' }
];

function OrderList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  async function loadOrders() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      // We will filter in memory or fetch from the API. The API supports status parameter!
      if (activeTab) params.status = activeTab;

      const res = await sellerApi.getOrders(params);
      if (res.success) {
        setItems(res.orders);
      } else {
        setErrorMsg('Failed to load orders.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [search, activeTab]);

  // Compute status counts in memory for all matching items of this seller
  const [statusCounts, setStatusCounts] = useState({
    All: 0, Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0
  });

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await sellerApi.getOrders();
        if (res.success) {
          const list = res.orders;
          const counts = {
            All: list.length,
            Pending: list.filter(i => i.fulfillmentStatus === 'Pending').length,
            Processing: list.filter(i => i.fulfillmentStatus === 'Processing').length,
            Shipped: list.filter(i => i.fulfillmentStatus === 'Shipped').length,
            Delivered: list.filter(i => i.fulfillmentStatus === 'Delivered').length,
            Cancelled: list.filter(i => i.fulfillmentStatus === 'Cancelled').length
          };
          setStatusCounts(counts);
        }
      } catch (err) {
        console.error('Failed to load counts:', err);
      }
    }
    loadCounts();
  }, [items]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>;
      case 'Processing': return <span className={`${styles.badge} ${styles.badgeProcessing}`}>Processing</span>;
      case 'Shipped': return <span className={`${styles.badge} ${styles.badgeShipped}`}>Shipped</span>;
      case 'Delivered': return <span className={`${styles.badge} ${styles.badgeDelivered}`}>Delivered</span>;
      case 'Cancelled': return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Cancelled</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  const getCount = (tabId) => {
    if (tabId === '') return statusCounts.All;
    return statusCounts[tabId] || 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>Orders Fulfillment</h1>
        <p className={styles.subtitle}>Track buyer purchases, update tracking details, and manage unstitched pack shipments.</p>
      </div>

      {/* Tabs Header */}
      <div className={styles.tabsCard}>
        <ul className={styles.tabsList}>
          {TABS.map(tab => (
            <li key={tab.id}>
              <button
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className={styles.countBadge}>{getCount(tab.id)}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search Order # or Saree..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: '70px', backgroundColor: 'var(--border-color)', borderRadius: '12px' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={styles.ordersCard}>
          <div className={styles.emptyState}>
            <FiShoppingBag style={{ fontSize: '48px', color: 'var(--accent-blush)', marginBottom: '16px' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-color)' }}>No Orders Yet</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
              We'll notify you here immediately once customers order your gorgeous sarees. Keep your inventory updated!
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.ordersCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Order #</th>
                  <th className={styles.th}>Saree</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Customer</th>
                  <th className={styles.th}>Total</th>
                  <th className={styles.th}>Fulfillment</th>
                  <th className={styles.th}>Payment</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={styles.tr}>
                    <td className={styles.td}>
                      <Link to={`/orders/${item.orderId}`} className={styles.orderNumLink}>
                        #{item.orderNumber}
                      </Link>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.orderProductCell}>
                        <img src={item.productImage} alt={item.productName} className={styles.productImg} />
                        <div className={styles.productInfo}>
                          <span className={styles.productName}>{item.productName}</span>
                          <span className={styles.qtyPrice}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{item.customerName}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.customerEmail}</span>
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontWeight: 700, color: 'var(--gold-color)' }}>
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </td>
                    <td className={styles.td}>
                      {getStatusBadge(item.fulfillmentStatus)}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge}`} style={{ 
                        backgroundColor: item.paymentStatus === 'Paid' ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: item.paymentStatus === 'Paid' ? 'var(--success-color)' : 'var(--warning-color)'
                      }}>
                        {item.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderList;
