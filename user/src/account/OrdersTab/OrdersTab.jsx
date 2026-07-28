import React, { useState, useEffect } from 'react';
import { FiPackage, FiChevronDown, FiChevronUp, FiMapPin, FiCreditCard, FiTruck, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';
import styles from './OrdersTab.module.css';

function OrdersTab({ orders: parentOrders }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchUserOrders = () => {
    setLoading(true);
    api.getMyOrders()
      .then((data) => {
        const rawList = data.success && Array.isArray(data.orders) ? data.orders : (Array.isArray(data.data) ? data.data : []);
        if (rawList.length > 0) {
          const formatted = rawList.map(o => {
            let addr = o.shipping_address || o.shippingAddress;
            if (typeof addr === 'string') {
              try { addr = JSON.parse(addr); } catch (e) {}
            }
            let addrStr = '';
            if (addr && typeof addr === 'object') {
              addrStr = `${addr.name || addr.fullName || ''} (${addr.label || 'Address'}), ${addr.house ? addr.house + ', ' : ''}${addr.street || addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || 'Tamil Nadu'} - ${addr.pincode || ''}, Phone: ${addr.phone || ''}`.trim();
            } else {
              addrStr = String(addr || 'Address registered on checkout');
            }

            const rawItems = Array.isArray(o.items) ? o.items.filter(i => i && (i.id || i.productName || i.name)) : [];
            const formattedItems = rawItems.map(i => ({
              id: i.id || i.productId || Math.random(),
              name: i.productName || i.name || 'Silk Saree',
              fabric: i.fabric || 'Silk',
              quantity: Number(i.quantity || 1),
              price: Number(i.price || i.price_at_purchase || 0),
              image: i.image || i.image_url || '/src/assets/hero_saree_model.png'
            }));

            return {
              id: o.order_number || o.orderNumber || `HS-ORD-${o.id}`,
              dbId: o.id,
              date: o.created_at || o.createdAt ? new Date(o.created_at || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
              status: o.order_status || o.orderStatus || 'Confirmed',
              paymentStatus: o.payment_status || o.paymentStatus || 'Pending',
              paymentMethod: o.payment_method || o.paymentMethod || 'Pay Online',
              totalPrice: Number(o.total_amount || o.totalAmount || 0),
              shippingAddress: addrStr,
              razorpayPaymentId: o.razorpay_payment_id || o.razorpayPaymentId || '',
              razorpayOrderId: o.razorpay_order_id || o.razorpayOrderId || '',
              trackingNumber: o.tracking_number || o.trackingNumber || '',
              courierName: o.courier_name || o.courierName || '',
              items: formattedItems
            };
          });
          setOrders(formatted);
        } else if (Array.isArray(parentOrders) && parentOrders.length > 0) {
          setOrders(parentOrders);
        } else {
          setOrders([]);
        }
      })
      .catch((err) => {
        console.warn('[OrdersTab] Live fetch warning:', err.message);
        if (Array.isArray(parentOrders)) {
          setOrders(parentOrders);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserOrders();
  }, [parentOrders]);

  const handleCancelOrder = async (orderDbId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const token = localStorage.getItem('hs_user_token');
        const res = await fetch(`http://localhost:5001/api/orders/${orderDbId}/cancel`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          alert('Order cancelled successfully.');
          fetchUserOrders();
        } else {
          alert(data.message || 'Failed to cancel order.');
        }
      } catch (err) {
        alert('Network error while cancelling order.');
      }
    }
  };

  const handleReturnOrder = async (orderDbId) => {
    const reason = window.prompt('Please enter a reason for your return request:');
    if (reason !== null) {
      try {
        const token = localStorage.getItem('hs_user_token');
        const res = await fetch(`http://localhost:5001/api/orders/${orderDbId}/return`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        const data = await res.json();
        if (data.success) {
          alert('Return request submitted successfully.');
          fetchUserOrders();
        } else {
          alert(data.message || 'Failed to submit return request.');
        }
      } catch (err) {
        alert('Network error while submitting return request.');
      }
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'All') return true;
    const st = (ord.status || '').toLowerCase();
    const flt = filter.toLowerCase();
    return st === flt;
  });

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className={styles.tabTitle}>My Orders</h2>
          <button
            onClick={fetchUserOrders}
            title="Refresh Orders"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d11b69', display: 'flex', alignItems: 'center' }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        <span className={styles.subCount}>{orders.length} Total Orders</span>
      </div>

      {/* Filter Pills */}
      <div className={styles.filterBar}>
        {['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`${styles.filterBtn} ${filter === st ? styles.activeFilter : ''}`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          <FiPackage style={{ fontSize: '2rem', opacity: 0.5, marginBottom: '10px' }} />
          <p>Loading your orders from Neon PostgreSQL...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
          <FiPackage style={{ fontSize: '2.5rem', opacity: 0.4, marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#333' }}>No Orders Found</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>You have not placed any orders matching "{filter}".</p>
        </div>
      ) : (
        /* Orders List */
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader} onClick={() => toggleExpand(order.id)}>
                  <div className={styles.headerLeft}>
                    <FiPackage className={styles.pkgIcon} />
                    <div>
                      <h4 className={styles.orderId}>Order #{order.id}</h4>
                      <span className={styles.orderDate}>Placed on {order.date}</span>
                    </div>
                  </div>

                  <div className={styles.headerRight}>
                    <span className={`${styles.statusBadge} ${styles[(order.status || 'confirmed').toLowerCase().replace(/\s+/g, '')] || styles.processing}`}>
                      {order.status || 'Confirmed'}
                    </span>
                    <strong className={styles.totalPrice}>₹{(order.totalPrice || 0).toLocaleString()}</strong>
                    <button className={styles.expandBtn}>
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className={styles.itemsPreview}>
                  {(order.items || []).map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <img src={item.image} alt={item.name} className={styles.itemThumb} />
                      <div className={styles.itemInfo}>
                        <h5 className={styles.itemName}>{item.name}</h5>
                        <span className={styles.itemMeta}>Fabric: {item.fabric} | Qty: {item.quantity}</span>
                      </div>
                      <span className={styles.itemPrice}>₹{(item.price || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Expanded Detailed Accordion */}
                {isExpanded && (
                  <div className={styles.expandedPanel}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailBox}>
                        <h6><FiMapPin style={{ marginRight: '4px' }} /> Shipping Address</h6>
                        <p style={{ whiteSpace: 'pre-line' }}>{order.shippingAddress || 'Registered shipping address'}</p>
                      </div>
                      <div className={styles.detailBox}>
                        <h6><FiCreditCard style={{ marginRight: '4px' }} /> Payment Details</h6>
                        <p><strong>Method:</strong> {order.paymentMethod || 'Pay Online'}</p>
                        <p><strong>Status:</strong> {order.paymentStatus || 'Pending'}</p>
                        {order.razorpayPaymentId && (
                          <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                            Ref ID: {order.razorpayPaymentId}
                          </p>
                        )}
                      </div>
                      <div className={styles.detailBox}>
                        <h6><FiTruck style={{ marginRight: '4px' }} /> Order Status & Tracking</h6>
                        <p><strong>Status:</strong> {order.status}</p>
                        {order.trackingNumber && (
                          <>
                            <p><strong>Courier:</strong> {order.courierName || 'Express Courier'}</p>
                            <p><strong>AWB / Tracking:</strong> {order.trackingNumber}</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Customer Actions Bar: Cancel / Return */}
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      {['Pending', 'Confirmed'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.dbId || order.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #d32f2f',
                            color: '#d32f2f',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => handleReturnOrder(order.dbId || order.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#d11b69',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Request Return
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersTab;
