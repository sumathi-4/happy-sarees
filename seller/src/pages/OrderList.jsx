import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiShoppingBag, FiEye, FiEdit2, FiPackage,
  FiTruck, FiCheckCircle, FiX, FiRefreshCw, FiFilter, FiChevronDown
} from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Orders.module.css';

const TABS = [
  { id: '',           label: 'All Orders',  color: 'var(--primary-color)' },
  { id: 'Pending',    label: 'Pending',     color: 'var(--warning-color)' },
  { id: 'Processing', label: 'Processing',  color: 'var(--info-color, #3b82f6)' },
  { id: 'Shipped',    label: 'Shipped',     color: 'var(--secondary-color)' },
  { id: 'Delivered',  label: 'Delivered',   color: 'var(--success-color)' },
  { id: 'Cancelled',  label: 'Cancelled',   color: 'var(--error-color)' }
];

const STATUS_TRANSITIONS = {
  Pending:    ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered'],
  Delivered:  [],
  Cancelled:  []
};

function OrderList() {
  const [items,        setItems]        = useState([]);
  const [allItems,     setAllItems]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [activeTab,    setActiveTab]    = useState('');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [toastMsg,     setToastMsg]     = useState('');
  // Edit status modal
  const [editItem,     setEditItem]     = useState(null);
  const [newStatus,    setNewStatus]    = useState('');
  const [trackingNo,   setTrackingNo]   = useState('');
  const [saving,       setSaving]       = useState(false);
  // View modal
  const [viewItem,     setViewItem]     = useState(null);

  const navigate = useNavigate();

  /* ── Load orders ── */
  async function loadOrders() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await sellerApi.getOrders({});
      if (res.success) {
        setAllItems(res.orders);
      } else {
        setErrorMsg('Failed to load orders.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  /* ── Filter in-memory ── */
  useEffect(() => {
    let filtered = allItems;
    if (activeTab) {
      filtered = filtered.filter(i => i.fulfillmentStatus === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        (i.orderNumber || '').toLowerCase().includes(q) ||
        (i.productName || '').toLowerCase().includes(q) ||
        (i.customerName || '').toLowerCase().includes(q)
      );
    }
    setItems(filtered);
  }, [allItems, activeTab, search]);

  /* ── Status counts ── */
  const getCount = (tabId) => {
    if (tabId === '') return allItems.length;
    return allItems.filter(i => i.fulfillmentStatus === tabId).length;
  };

  /* ── Toast helper ── */
  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }

  /* ── Status badge ── */
  const getStatusBadge = (status) => {
    const map = {
      Pending:    styles.badgePending,
      Processing: styles.badgeProcessing,
      Shipped:    styles.badgeShipped,
      Delivered:  styles.badgeDelivered,
      Cancelled:  styles.badgeCancelled,
    };
    return (
      <span className={`${styles.badge} ${map[status] || ''}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const isPaid = status === 'Paid';
    return (
      <span className={`${styles.badge} ${isPaid ? styles.badgeDelivered : styles.badgePending}`}>
        {status}
      </span>
    );
  };

  /* ── Open edit modal ── */
  const openEdit = (item) => {
    setEditItem(item);
    setNewStatus(item.fulfillmentStatus);
    setTrackingNo(item.trackingNumber || '');
  };

  /* ── Save status update ── */
  const saveStatus = async () => {
    if (!editItem || !newStatus) return;
    setSaving(true);
    try {
      await sellerApi.updateOrderItemStatus(editItem.id, newStatus, trackingNo || undefined);
      showToast(`Order #${editItem.orderNumber} updated to ${newStatus}`);
      setEditItem(null);
      await loadOrders();
    } catch (err) {
      showToast('Failed to update: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.olContainer}>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className={styles.olToast}>
          <FiCheckCircle /> {toastMsg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className={styles.olHeader}>
        <div>
          <span className={styles.olEyebrow}>Seller Portal</span>
          <h1 className={styles.olTitle}>Orders Fulfillment</h1>
          <p className={styles.olSubtitle}>Track buyer purchases, update fulfillment status, and manage shipments.</p>
        </div>
        <button className={styles.olRefreshBtn} onClick={loadOrders} title="Refresh">
          <FiRefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className={styles.olStatsRow}>
        {[
          { label: 'Total Orders',  value: allItems.length,                                                       accent: 'var(--primary-color)' },
          { label: 'Pending',       value: allItems.filter(i => i.fulfillmentStatus === 'Pending').length,         accent: 'var(--warning-color)' },
          { label: 'Processing',    value: allItems.filter(i => i.fulfillmentStatus === 'Processing').length,      accent: '#3b82f6' },
          { label: 'Shipped',       value: allItems.filter(i => i.fulfillmentStatus === 'Shipped').length,         accent: 'var(--secondary-color)' },
          { label: 'Delivered',     value: allItems.filter(i => i.fulfillmentStatus === 'Delivered').length,       accent: 'var(--success-color)' },
        ].map(s => (
          <div key={s.label} className={styles.olStatCard} style={{ borderLeftColor: s.accent }}>
            <span className={styles.olStatLabel}>{s.label}</span>
            <span className={styles.olStatValue} style={{ color: s.accent }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs + Search Bar ── */}
      <div className={styles.olTabsBar}>
        <div className={styles.olTabsList}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.olTabBtn} ${activeTab === tab.id ? styles.olTabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? { color: tab.color, borderBottomColor: tab.color } : {}}
            >
              {tab.label}
              <span className={`${styles.olCountPill} ${activeTab === tab.id ? styles.olCountPillActive : ''}`}
                style={activeTab === tab.id ? { background: tab.color } : {}}>
                {getCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.olSearchBox}>
          <FiSearch className={styles.olSearchIcon} />
          <input
            type="text"
            placeholder="Search order # or product…"
            className={styles.olSearchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.olSearchClear} onClick={() => setSearch('')}>
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {errorMsg && (
        <div className={styles.olErrorBanner}>
          ⚠ {errorMsg}
        </div>
      )}

      {/* ── Table Card ── */}
      <div className={styles.olCard}>
        {loading ? (
          <div className={styles.olSkeletonWrap}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.olSkeletonRow} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={styles.olEmpty}>
            <FiShoppingBag size={52} style={{ color: 'var(--accent-blush, #e9b4c8)', marginBottom: '16px' }} />
            <h3 className={styles.olEmptyTitle}>No Orders Found</h3>
            <p className={styles.olEmptyDesc}>
              {search || activeTab
                ? 'No orders match your current filter. Try clearing the search or switching tabs.'
                : 'Orders will appear here once customers purchase your sarees.'}
            </p>
          </div>
        ) : (
          <div className={styles.olTableWrapper}>
            <table className={styles.olTable}>
              <thead>
                <tr>
                  <th className={styles.olTh}>Order #</th>
                  <th className={styles.olTh}>Saree</th>
                  <th className={styles.olTh}>Date</th>
                  <th className={styles.olTh}>Customer</th>
                  <th className={styles.olTh} style={{ textAlign: 'right' }}>Total</th>
                  <th className={styles.olTh}>Fulfillment</th>
                  <th className={styles.olTh}>Payment</th>
                  <th className={styles.olTh} style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className={styles.olTr}>

                    {/* Order # */}
                    <td className={styles.olTd}>
                      <span className={styles.olOrderNum}>#{item.orderNumber}</span>
                    </td>

                    {/* Saree */}
                    <td className={styles.olTd}>
                      <div className={styles.olProductCell}>
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className={styles.olProductImg}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className={styles.olProductInfo}>
                          <span className={styles.olProductName}>{item.productName}</span>
                          <span className={styles.olProductQty}>Qty: {item.quantity} · ₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className={styles.olTd}>
                      <span className={styles.olDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className={styles.olTd}>
                      <div className={styles.olCustomer}>
                        <span className={styles.olCustomerName}>{item.customerName}</span>
                        <span className={styles.olCustomerEmail}>{item.customerEmail}</span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className={styles.olTd} style={{ textAlign: 'right' }}>
                      <span className={styles.olTotal}>₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Fulfillment */}
                    <td className={styles.olTd}>{getStatusBadge(item.fulfillmentStatus)}</td>

                    {/* Payment */}
                    <td className={styles.olTd}>{getPaymentBadge(item.paymentStatus)}</td>

                    {/* Actions */}
                    <td className={styles.olTd}>
                      <div className={styles.olActions}>
                        {/* View */}
                        <button
                          className={`${styles.olActionBtn} ${styles.olActionView}`}
                          title="View Details"
                          onClick={() => setViewItem(item)}
                        >
                          <FiEye size={14} />
                          <span>View</span>
                        </button>
                        {/* Edit Status */}
                        {STATUS_TRANSITIONS[item.fulfillmentStatus]?.length > 0 && (
                          <button
                            className={`${styles.olActionBtn} ${styles.olActionEdit}`}
                            title="Update Status"
                            onClick={() => openEdit(item)}
                          >
                            <FiEdit2 size={14} />
                            <span>Update</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && items.length > 0 && (
          <div className={styles.olTableFooter}>
            Showing <strong>{items.length}</strong> order{items.length !== 1 ? 's' : ''}
            {(activeTab || search) && ' (filtered)'}
          </div>
        )}
      </div>

      {/* ── View Details Modal ── */}
      {viewItem && (
        <div className={styles.olModalOverlay} onClick={() => setViewItem(null)}>
          <div className={styles.olModal} onClick={e => e.stopPropagation()}>
            <div className={styles.olModalHeader}>
              <h3 className={styles.olModalTitle}>Order Details</h3>
              <button className={styles.olModalClose} onClick={() => setViewItem(null)}>
                <FiX size={18} />
              </button>
            </div>
            <div className={styles.olModalBody}>
              <div className={styles.olDetailGrid}>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Order #</span>
                  <span className={styles.olDetailValue} style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary-color)' }}>#{viewItem.orderNumber}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Date</span>
                  <span className={styles.olDetailValue}>{new Date(viewItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Product</span>
                  <span className={styles.olDetailValue}>{viewItem.productName}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Quantity</span>
                  <span className={styles.olDetailValue}>{viewItem.quantity}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Unit Price</span>
                  <span className={styles.olDetailValue}>₹{Number(viewItem.price).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Total</span>
                  <span className={styles.olDetailValue} style={{ fontWeight: 800, color: 'var(--gold-color)' }}>₹{Number(viewItem.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Customer</span>
                  <span className={styles.olDetailValue}>{viewItem.customerName}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Email</span>
                  <span className={styles.olDetailValue}>{viewItem.customerEmail}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Fulfillment</span>
                  <span>{getStatusBadge(viewItem.fulfillmentStatus)}</span>
                </div>
                <div className={styles.olDetailRow}>
                  <span className={styles.olDetailLabel}>Payment</span>
                  <span>{getPaymentBadge(viewItem.paymentStatus)}</span>
                </div>
                {viewItem.trackingNumber && (
                  <div className={styles.olDetailRow}>
                    <span className={styles.olDetailLabel}>Tracking #</span>
                    <span className={styles.olDetailValue}>{viewItem.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.olModalFooter}>
              <button className={styles.olBtnSecondary} onClick={() => setViewItem(null)}>Close</button>
              <Link to={`/orders/${viewItem.orderId}`} className={styles.olBtnPrimary}>
                Full Order Page →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Status Modal ── */}
      {editItem && (
        <div className={styles.olModalOverlay} onClick={() => setEditItem(null)}>
          <div className={styles.olModal} onClick={e => e.stopPropagation()}>
            <div className={styles.olModalHeader}>
              <h3 className={styles.olModalTitle}>Update Fulfillment Status</h3>
              <button className={styles.olModalClose} onClick={() => setEditItem(null)}>
                <FiX size={18} />
              </button>
            </div>
            <div className={styles.olModalBody}>
              <p className={styles.olModalDesc}>
                Order <strong>#{editItem.orderNumber}</strong> — {editItem.productName}
              </p>
              <div className={styles.olFieldGroup}>
                <label className={styles.olFieldLabel}>New Status</label>
                <select
                  className={styles.olSelect}
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                >
                  <option value={editItem.fulfillmentStatus}>{editItem.fulfillmentStatus} (current)</option>
                  {STATUS_TRANSITIONS[editItem.fulfillmentStatus]?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {(newStatus === 'Shipped' || newStatus === 'Processing') && (
                <div className={styles.olFieldGroup}>
                  <label className={styles.olFieldLabel}>Tracking Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    className={styles.olInput}
                    placeholder="e.g. DTDC1234567890"
                    value={trackingNo}
                    onChange={e => setTrackingNo(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className={styles.olModalFooter}>
              <button className={styles.olBtnSecondary} onClick={() => setEditItem(null)}>Cancel</button>
              <button
                className={styles.olBtnPrimary}
                onClick={saveStatus}
                disabled={saving || newStatus === editItem.fulfillmentStatus}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default OrderList;
