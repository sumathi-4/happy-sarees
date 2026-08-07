import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTruck, FiPackage, FiDollarSign, FiClock, FiCheck } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Orders.module.css';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updating, setUpdating] = useState(false);

  // Status updates state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  async function loadOrder() {
    try {
      const res = await sellerApi.getOrderById(id);
      if (res.success && res.order) {
        setOrder(res.order);
        // Prefill update selectors for the first item
        const firstItem = res.order.items[0];
        if (firstItem) {
          setSelectedItemId(firstItem.id);
          setFulfillmentStatus(firstItem.fulfillmentStatus);
          setTrackingNumber(firstItem.trackingNumber || '');
          setPaymentStatus(firstItem.paymentStatus || 'Paid');
        }
      } else {
        setErrorMsg('Failed to load order detail.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleItemSelect = (itemId) => {
    setSelectedItemId(itemId);
    const item = order.items.find(i => i.id === Number(itemId));
    if (item) {
      setFulfillmentStatus(item.fulfillmentStatus);
      setTrackingNumber(item.trackingNumber || '');
      setPaymentStatus(item.paymentStatus || 'Paid');
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      // 1. Update fulfillment status
      await sellerApi.updateOrderItemStatus(selectedItemId, fulfillmentStatus, trackingNumber);
      
      // 2. Update payment status
      await sellerApi.updateOrderItemPaymentStatus(selectedItemId, paymentStatus);

      alert('Order item statuses updated successfully.');
      loadOrder(); // reload
    } catch (err) {
      alert(err.message || 'An error occurred during update.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading order files...</div>;
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '20px', color: 'var(--error-color)', background: 'var(--error-bg)', borderRadius: '8px' }}>
        {errorMsg}
      </div>
    );
  }

  const first = order;
  const address = first.shippingAddress || {};

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => navigate('/orders')}>
          <FiArrowLeft />
        </button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Order #{first.orderNumber}</h1>
          <p className={styles.subtitle}>Placed on {new Date(first.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.detailGrid}>
        
        {/* Left Side: Items & customer address info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Saree Items belonging to seller */}
          <div className={styles.detailCard}>
            <h3 className={styles.sectionTitle}>Ordered Products</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {first.items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <img src={item.productImage} alt={item.productName} style={{ width: '80px', height: '105px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '15px' }}>{item.productName}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>SKU: {item.productSku}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '14px', color: 'var(--gold-color)', fontWeight: 700, marginTop: '4px' }}>Subtotal: ₹{item.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <span className={`${styles.badge} ${
                      item.fulfillmentStatus === 'Pending' ? styles.badgePending :
                      item.fulfillmentStatus === 'Processing' ? styles.badgeProcessing :
                      item.fulfillmentStatus === 'Shipped' ? styles.badgeShipped :
                      item.fulfillmentStatus === 'Delivered' ? styles.badgeDelivered : styles.badgeCancelled
                    }`}>
                      {item.fulfillmentStatus}
                    </span>
                    <span className={styles.badge} style={{
                      backgroundColor: item.paymentStatus === 'Paid' ? 'var(--success-bg)' : 'var(--warning-bg)',
                      color: item.paymentStatus === 'Paid' ? 'var(--success-color)' : 'var(--warning-color)'
                    }}>
                      Payment: {item.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className={styles.detailCard}>
            <h3 className={styles.sectionTitle}>Delivery Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--primary-color)', marginBottom: '8px' }}>Customer Contact</h4>
                <div className={styles.infoRow}>
                  <span>Name:</span>
                  <span className={styles.infoVal}>{first.customerName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Email:</span>
                  <span className={styles.infoVal}>{first.customerEmail}</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--primary-color)', marginBottom: '8px' }}>Shipping Address</h4>
                <div className={styles.addressBlock}>
                  <strong>{address.fullName || first.customerName}</strong><br />
                  {address.phone && <>Phone: {address.phone}<br /></>}
                  {address.streetAddress || address.address}<br />
                  {address.city}, {address.state} - {address.pincode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Update status controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={styles.statusCard}>
            <h3 className={styles.sectionTitle} style={{ marginBottom: '8px' }}>Fulfillment Panel</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Saree Item</label>
              <select 
                className={styles.statusSelect}
                value={selectedItemId}
                onChange={(e) => handleItemSelect(e.target.value)}
              >
                {first.items.map(item => (
                  <option key={item.id} value={item.id}>{item.productName.slice(0, 24)}... (Qty: {item.quantity})</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Order Item Status</label>
              <select
                className={styles.statusSelect}
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {fulfillmentStatus === 'Shipped' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Tracking / Waybill Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890 (Delhivery / Bluedart)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Settlement Payment Status</label>
              <select
                className={styles.statusSelect}
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="Paid">Paid</option>
                <option value="Payout Pending">Payout Pending</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <button 
              className={styles.btnPrimary}
              style={{ width: '100%', marginTop: '12px' }}
              onClick={handleUpdateStatus}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetail;
