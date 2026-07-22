import React, { useState } from 'react';
import { 
  FiTag, FiTrash2, FiEdit2, FiCheck, FiX, FiBell, 
  FiShoppingBag, FiAlertTriangle, FiPercent, FiUserPlus, FiXCircle 
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/Coupons.module.css';

function Coupons() {
  const { coupons, setCoupons, notifications, setNotifications } = useAdminData();

  // Active coupon selected for editing (null means create mode)
  const [editingCode, setEditingCode] = useState(null);

  // Create/Edit form values state
  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    discountValue: '',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: 1,
    startDate: '',
    expiryDate: '',
    status: 'Active'
  });

  // Notification filter state: 'all' | 'unread' | 'read'
  const [notifFilter, setNotifFilter] = useState('all');

  // Toast alert
  const [toastMsg, setToastMsg] = useState(null);
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Populate form for editing
  const handleEditClick = (coupon) => {
    setEditingCode(coupon.code);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      discountValue: coupon.discountValue,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount || '',
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      status: coupon.status
    });
    triggerToast(`Editing coupon ${coupon.code}.`);
  };

  // Cancel edit mode
  const handleCancelForm = () => {
    setEditingCode(null);
    setFormData({
      code: '',
      type: 'Percentage',
      discountValue: '',
      minOrder: '',
      maxDiscount: '',
      usageLimit: '',
      perUserLimit: 1,
      startDate: '',
      expiryDate: '',
      status: 'Active'
    });
  };

  // Save / Add coupon handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.minOrder) {
      alert("Coupon Code, Discount Value, and Minimum Order amount are required.");
      return;
    }

    const discountLabel = formData.type === 'Percentage' 
      ? `${formData.discountValue}% OFF` 
      : `₹${formData.discountValue} OFF`;

    const nextCoupon = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
      discount: discountLabel,
      discountValue: Number(formData.discountValue),
      minOrder: Number(formData.minOrder),
      maxDiscount: Number(formData.maxDiscount) || 0,
      usageLimit: Number(formData.usageLimit) || 100,
      usageCount: editingCode ? (coupons.find(c => c.code === editingCode)?.usageCount || 0) : 0,
      perUserLimit: Number(formData.perUserLimit) || 1,
      status: formData.status
    };

    if (editingCode) {
      // Edit mode
      setCoupons(prev => prev.map(c => c.code === editingCode ? nextCoupon : c));
      triggerToast(`Coupon ${nextCoupon.code} updated successfully.`);
    } else {
      // Add mode
      if (coupons.some(c => c.code === nextCoupon.code)) {
        alert("A coupon with this code already exists. Please choose a unique name.");
        return;
      }
      setCoupons([{ ...nextCoupon, usageCount: 0 }, ...coupons]);
      triggerToast(`Coupon ${nextCoupon.code} created successfully.`);
    }

    handleCancelForm();
  };

  // Delete coupon
  const handleDeleteCoupon = (code) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      setCoupons(prev => prev.filter(c => c.code !== code));
      triggerToast(`Coupon ${code} deleted.`);
      if (editingCode === code) {
        handleCancelForm();
      }
    }
  };

  // Notification center triggers
  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDeleteNotif = (id, e) => {
    e.stopPropagation(); // prevent mark as read
    setNotifications(prev => prev.filter(n => n.id !== id));
    triggerToast("Notification deleted.");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    triggerToast("All notifications marked as read.");
  };

  // Filtered notifications list
  const getFilteredNotifs = () => {
    if (notifFilter === 'unread') {
      return notifications.filter(n => !n.read);
    } else if (notifFilter === 'read') {
      return notifications.filter(n => n.read);
    }
    return notifications;
  };

  const filteredNotifs = getFilteredNotifs();

  // Helper to map type icons
  const getNotifIcon = (type) => {
    switch (type) {
      case 'order': return <FiShoppingBag className={styles.iconOrder} />;
      case 'stock': return <FiAlertTriangle className={styles.iconStock} />;
      case 'coupon': return <FiPercent className={styles.iconCoupon} />;
      case 'customer': return <FiUserPlus className={styles.iconCustomer} />;
      case 'payment': return <FiXCircle className={styles.iconPayment} />;
      case 'cancel': return <FiXCircle className={styles.iconCancel} />;
      default: return <FiBell className={styles.iconDefault} />;
    }
  };

  return (
    <div className={styles.wrapper}>
      {toastMsg && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMsg}
        </div>
      )}

      {/* Main split grid row */}
      <div className={styles.threeColumnGrid}>
        
        {/* Column 1: Coupon list card */}
        <div className={styles.cardCol}>
          <div className={styles.cardHeader}>
            <h3>Coupon Curation</h3>
            <button className={styles.createBtn} onClick={handleCancelForm}>+ Create Coupon</button>
          </div>
          
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon, i) => (
                  <tr key={i} className={editingCode === coupon.code ? styles.rowEditing : ''}>
                    <td><strong style={{ color: '#d11b69' }}>{coupon.code}</strong></td>
                    <td><span className={styles.typeText}>{coupon.type}</span></td>
                    <td><strong>{coupon.discount}</strong></td>
                    <td>₹{coupon.minOrder}</td>
                    <td>{coupon.usageCount}/{coupon.usageLimit}</td>
                    <td>
                      <span className={`${styles.statusPill} ${coupon.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                        {coupon.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.rowBtn} onClick={() => handleEditClick(coupon)} title="Edit Coupon"><FiEdit2 /></button>
                      <button className={styles.rowBtn} onClick={() => handleDeleteCoupon(coupon.code)} title="Delete Coupon" style={{ color: '#d32f2f' }}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Create / Edit Form card */}
        <div className={styles.cardCol}>
          <div className={styles.cardHeader}>
            <h3>{editingCode ? `Edit Coupon: ${editingCode}` : 'Create Coupon'}</h3>
          </div>
          
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Coupon Code</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. HAPPY10"
                  disabled={!!editingCode} // code is key identifier
                />
              </div>

              <div className={styles.formGroup}>
                <label>Coupon Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Percentage">Percentage Discount</option>
                  <option value="Flat">Flat Cash Discount</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Discount Value ({formData.type === 'Percentage' ? '%' : '₹'})</label>
                <input 
                  type="number" 
                  value={formData.discountValue} 
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder={formData.type === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Minimum Order Amount</label>
                <input 
                  type="number" 
                  value={formData.minOrder} 
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  placeholder="e.g. 1500"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Maximum Discount (₹ cap)</label>
                <input 
                  type="number" 
                  value={formData.maxDiscount} 
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="e.g. 1000"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Usage Limit (Max claims)</label>
                <input 
                  type="number" 
                  value={formData.usageLimit} 
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="e.g. 100"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Per User Claim Limit</label>
                <input 
                  type="number" 
                  value={formData.perUserLimit} 
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Start Date</label>
                <input 
                  type="text" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="e.g. 15 Jun 2026"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input 
                  type="text" 
                  value={formData.expiryDate} 
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  placeholder="e.g. 30 Dec 2026"
                />
              </div>

              <div className={styles.toggleRow}>
                <span>Active Status</span>
                <label className={styles.switchLabel}>
                  <input 
                    type="checkbox" 
                    checked={formData.status === 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })} 
                  />
                  <span className={styles.switchSlider} />
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={handleCancelForm}>Cancel</button>
              <button type="submit" className={styles.saveBtn}>Save Coupon</button>
            </div>
          </form>
        </div>

        {/* Column 3: Notification center card */}
        <div className={styles.cardCol}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBell className={styles.bellIcon} />
              <h3>Notification Center</h3>
            </div>
            <button className={styles.markAllBtn} onClick={handleMarkAllRead}>Mark Read</button>
          </div>

          {/* Inner filters */}
          <div className={styles.notifFilters}>
            <button className={`${styles.filterBtn} ${notifFilter === 'all' ? styles.filterBtnActive : ''}`} onClick={() => setNotifFilter('all')}>All</button>
            <button className={`${styles.filterBtn} ${notifFilter === 'unread' ? styles.filterBtnActive : ''}`} onClick={() => setNotifFilter('unread')}>Unread</button>
            <button className={`${styles.filterBtn} ${notifFilter === 'read' ? styles.filterBtnActive : ''}`} onClick={() => setNotifFilter('read')}>Read</button>
          </div>

          {/* List items block */}
          <div className={styles.notifList}>
            {filteredNotifs.length > 0 ? (
              filteredNotifs.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`${styles.notifCard} ${!notif.read ? styles.notifUnread : ''}`}
                  onClick={() => handleMarkAsRead(notif.id)}
                >
                  <span className={styles.notifIconSlot}>
                    {getNotifIcon(notif.type)}
                  </span>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong className={styles.notifTitle}>{notif.title}</strong>
                      <span className={styles.notifTime}>{notif.time}</span>
                    </div>
                    <p className={styles.notifMsg}>{notif.message}</p>
                  </div>

                  <div className={styles.notifActions}>
                    {!notif.read && <span className={styles.redDot} />}
                    <button className={styles.trashNotifBtn} onClick={(e) => handleDeleteNotif(notif.id, e)}>✕</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999999' }}>
                <FiBell style={{ fontSize: '24px', marginBottom: '8px', color: '#999' }} />
                <p>No notifications available.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Coupons;
