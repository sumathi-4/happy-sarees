import React, { useState } from 'react';
import { 
  FiTag, FiTrash2, FiEdit2, FiCheck, FiX, FiPlus, 
  FiArrowLeft, FiCopy, FiSearch, FiFilter,
  FiPower, FiClock, FiRepeat
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import { couponsApi } from '../api/adminApi';
import styles from '../styles/Coupons.module.css';

// Automatic Coupon Status Computation Logic
const getCouponStatus = (coupon) => {
  if (!coupon) return 'Active';

  // 1. Check if Expiry Date has passed
  if (coupon.expiryDate || coupon.expires_at) {
    const expDate = new Date(coupon.expiryDate || coupon.expires_at);
    if (!isNaN(expDate.getTime())) {
      const endOfExpDate = new Date(expDate);
      endOfExpDate.setHours(23, 59, 59, 999);
      if (new Date() > endOfExpDate) {
        return 'Expired';
      }
    }
  }

  if (coupon.computed_status === 'expired') {
    return 'Expired';
  }

  // 2. Check Active status flag
  const isInactive = coupon.is_active === false || coupon.is_active === 'false' || coupon.is_active === 0 ||
                     (coupon.status && (coupon.status.toLowerCase() === 'inactive' || coupon.status.toLowerCase() === 'disabled')) ||
                     coupon.computed_status === 'inactive';

  if (isInactive) {
    return 'Inactive';
  }

  return 'Active';
};

function Coupons() {
  const { coupons, setCoupons, refreshCoupons } = useAdminData();

  // Mode: false = Table View, true = Create/Edit Form View
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
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

  // Toast alert
  const [toastMsg, setToastMsg] = useState(null);
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingCode(null);
    setEditingId(null);
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
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleEditClick = (coupon) => {
    setEditingCode(coupon.code);
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code,
      type: coupon.type || (coupon.value ? 'Percentage' : 'Flat'),
      discountValue: coupon.discountValue || coupon.value || (coupon.discount ? coupon.discount.replace(/\D/g, '') : ''),
      minOrder: coupon.minOrder || coupon.min_order_amount || coupon.min || '',
      maxDiscount: coupon.maxDiscount || coupon.max_discount_amount || coupon.max || '',
      usageLimit: coupon.usageLimit || coupon.usage_limit || coupon.limit || '',
      perUserLimit: coupon.perUserLimit || coupon.per_user_limit || 1,
      startDate: coupon.startDate || (coupon.starts_at ? new Date(coupon.starts_at).toISOString().split('T')[0] : ''),
      expiryDate: coupon.expiryDate || (coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''),
      status: getCouponStatus(coupon) === 'Inactive' ? 'Inactive' : 'Active'
    });
    setIsFormOpen(true);
  };

  // Quick 1-Click Status Toggle from Table Row Action
  const handleToggleStatus = async (coupon) => {
    const currentStatus = getCouponStatus(coupon);
    
    if (currentStatus === 'Expired') {
      triggerToast(`Coupon ${coupon.code} is expired. Update expiry date to reactivate.`);
      return;
    }

    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Optimistic UI Update
    setCoupons(prev => prev.map(c => {
      if (c.code === coupon.code || (c.id && c.id === coupon.id)) {
        return {
          ...c,
          status: newStatus,
          is_active: newStatus === 'Active',
          computed_status: newStatus.toLowerCase()
        };
      }
      return c;
    }));

    // Call Backend API
    if (coupon.id) {
      try {
        await couponsApi.toggle(coupon.id);
        if (refreshCoupons) refreshCoupons();
      } catch (e) {
        console.warn('Coupon toggle API warning:', e.message);
      }
    }

    triggerToast(`Coupon ${coupon.code} set to ${newStatus}!`);
  };

  // Cancel / Close Form
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingCode(null);
    setEditingId(null);
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      triggerToast(`Copied code "${code}" to clipboard! 📋`);
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      triggerToast('Please enter a valid coupon code.');
      return;
    }

    const formattedDiscount = formData.type === 'Percentage' 
      ? `${formData.discountValue}% OFF` 
      : `₹${formData.discountValue} OFF`;

    const apiPayload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.code.trim().toUpperCase(),
      type: formData.type.toLowerCase(),
      value: Number(formData.discountValue) || 0,
      min_order_amount: Number(formData.minOrder) || 0,
      min_order: Number(formData.minOrder) || 0,
      max_discount_amount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      max_discount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usage_limit: formData.usageLimit ? Number(formData.usageLimit) : 100,
      per_user_limit: Number(formData.perUserLimit) || 1,
      expires_at: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      is_active: formData.status === 'Active'
    };

    if (editingCode) {
      // Update existing coupon
      setCoupons(prev => prev.map(c => {
        if (c.code === editingCode || c.id === editingId) {
          return {
            ...c,
            ...apiPayload,
            discount: formattedDiscount,
            discountValue: formData.discountValue,
            minOrder: formData.minOrder,
            maxDiscount: formData.maxDiscount,
            usageLimit: formData.usageLimit,
            perUserLimit: formData.perUserLimit,
            startDate: formData.startDate,
            expiryDate: formData.expiryDate,
            status: formData.status
          };
        }
        return c;
      }));

      if (editingId) {
        try {
          await couponsApi.update(editingId, apiPayload);
          if (refreshCoupons) refreshCoupons();
        } catch (e) {
          console.warn('Coupon update API warning:', e.message);
        }
      }

      triggerToast(`Coupon ${editingCode} updated successfully! 🎉`);
    } else {
      // Create new coupon
      const newCoupon = {
        id: Date.now(),
        ...apiPayload,
        discount: formattedDiscount,
        discountValue: formData.discountValue,
        usageCount: 0,
        usage_count: 0,
        startDate: formData.startDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        expiryDate: formData.expiryDate || '2026-12-31',
        status: formData.status
      };

      setCoupons(prev => [newCoupon, ...prev]);

      try {
        await couponsApi.create(apiPayload);
        if (refreshCoupons) refreshCoupons();
      } catch (e) {
        console.warn('Coupon create API warning:', e.message);
      }

      triggerToast(`New Coupon ${newCoupon.code} created successfully! 🏷️`);
    }

    setIsFormOpen(false);
    setEditingCode(null);
    setEditingId(null);
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    const code = coupon.code || coupon;
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      setCoupons(prev => prev.filter(c => c.code !== code && c.id !== coupon.id));

      if (coupon.id) {
        try {
          await couponsApi.delete(coupon.id);
          if (refreshCoupons) refreshCoupons();
        } catch (e) {
          console.warn('Coupon delete API warning:', e.message);
        }
      }

      triggerToast(`Coupon ${code} deleted.`);
    }
  };

  // 4 Business Summary Counters
  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter(c => getCouponStatus(c) === 'Active').length;
  const expiredCouponsCount = coupons.filter(c => getCouponStatus(c) === 'Expired').length;
  const totalRedemptionsCount = coupons.reduce((sum, c) => sum + Number(c.usageCount || c.usage_count || 0), 0);

  // Filtered Coupons for Table
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.type || '').toLowerCase().includes(searchQuery.toLowerCase());
    const computedStatus = getCouponStatus(c);
    const matchesStatus = statusFilter === 'All' || computedStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.wrapper}>
      {toastMsg && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px', color: 'var(--success-color)' }} />
          {toastMsg}
        </div>
      )}

      {!isFormOpen ? (
        /* ── VIEW 1: Full-Width Coupon Curation Table ──────────────── */
        <div className={styles.mainContainer}>
          {/* Header Bar */}
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.pageSubtitle}>Manage promotional codes, discounts, and customer redemptions</p>
            </div>
            <button className={styles.primaryCreateBtn} onClick={handleOpenCreate}>
              <FiPlus style={{ fontSize: '18px' }} />
              Create Coupon
            </button>
          </div>

          {/* 4 Summary Dashboard Cards */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIconBox} style={{ backgroundColor: '#fce4ec', color: 'var(--primary-color)' }}>
                <FiTag />
              </div>
              <div>
                <span className={styles.statVal}>{totalCouponsCount}</span>
                <span className={styles.statLbl}>Total Coupons</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox} style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)' }}>
                <FiCheck />
              </div>
              <div>
                <span className={styles.statVal}>{activeCouponsCount}</span>
                <span className={styles.statLbl}>Active Coupons</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox} style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-color)' }}>
                <FiClock />
              </div>
              <div>
                <span className={styles.statVal}>{expiredCouponsCount}</span>
                <span className={styles.statLbl}>Expired Coupons</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconBox} style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-color)' }}>
                <FiRepeat />
              </div>
              <div>
                <span className={styles.statVal}>{totalRedemptionsCount}</span>
                <span className={styles.statLbl}>Total Redemptions</span>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search & Status Filters */}
          <div className={styles.controlsRow}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search coupon code or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* 4 Filter Pills: All, Active, Inactive, Expired */}
            <div className={styles.filterPills}>
              {['All', 'Active', 'Inactive', 'Expired'].map((status) => (
                <button
                  key={status}
                  className={`${styles.pillBtn} ${statusFilter === status ? styles.pillActive : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Full-Width Table Card */}
          <div className={styles.tableCard}>
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
                  {filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon, i) => {
                      const currentStatus = getCouponStatus(coupon);
                      const usedCount = coupon.usageCount ?? coupon.usage_count ?? 0;
                      const usageLimitVal = coupon.usageLimit ?? coupon.usage_limit ?? coupon.limit;
                      const limitDisplay = (usageLimitVal && Number(usageLimitVal) > 0) ? usageLimitVal : '∞';

                      let statusClass = styles.statusActive;
                      if (currentStatus === 'Inactive') statusClass = styles.statusInactive;
                      if (currentStatus === 'Expired') statusClass = styles.statusExpired;

                      return (
                        <tr key={i} className={editingCode === coupon.code ? styles.rowEditing : ''}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong className={styles.codeBadge}>{coupon.code}</strong>
                              <button
                                className={styles.iconActionBtn}
                                onClick={() => handleCopyCode(coupon.code)}
                                title="Copy Code"
                              >
                                <FiCopy />
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={styles.typeTag}>{coupon.type || 'Percentage'}</span>
                          </td>
                          <td>
                            <strong className={styles.discountText}>
                              {coupon.discount || (coupon.value ? `${coupon.value}% OFF` : 'Discount')}
                            </strong>
                          </td>
                          <td>₹{Number(coupon.minOrder || coupon.min_order_amount || coupon.min || 0).toLocaleString()}</td>
                          <td>
                            <span className={styles.usageTag}>
                              {usedCount} / {limitDisplay}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.statusPill} ${statusClass}`}>
                              {currentStatus}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                              {/* 1-Click Status Toggle Button (Disabled if Expired) */}
                              <button
                                className={`${styles.statusToggleBtn} ${
                                  currentStatus === 'Active' ? styles.statusBtnActive : 
                                  currentStatus === 'Expired' ? styles.statusBtnExpired : styles.statusBtnInactive
                                }`}
                                onClick={() => handleToggleStatus(coupon)}
                                disabled={currentStatus === 'Expired'}
                                title={currentStatus === 'Expired' ? 'Expired' : `Click to toggle status`}
                              >
                                <FiPower style={{ fontSize: '12px' }} />
                                {currentStatus}
                              </button>

                              {/* Edit Button */}
                              <button
                                className={styles.actionBtnEdit}
                                onClick={() => handleEditClick(coupon)}
                                title="Edit Coupon Details"
                              >
                                <FiEdit2 /> Edit
                              </button>

                              {/* Delete Button */}
                              <button
                                className={styles.actionBtnDelete}
                                onClick={() => handleDeleteCoupon(coupon)}
                                title="Delete Coupon"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className={styles.emptyTd}>
                        No coupons found matching your search or status filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ── VIEW 2: Clean Full-Width Create / Edit Coupon Form ───────── */
        <div className={styles.formContainer}>
          {/* Form Header with Back Arrow */}
          <div className={styles.formHeaderRow}>
            <button className={styles.backBtn} onClick={handleCancelForm}>
              <FiArrowLeft style={{ fontSize: '18px' }} />
              Back to Coupons
            </button>
            <h2 className={styles.formCardTitle}>
              {editingCode ? `Edit Coupon: ${editingCode}` : 'Create New Coupon'}
            </h2>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleFormSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                
                {/* Coupon Code */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Coupon Code</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. HAPPY10"
                    disabled={!!editingCode}
                    className={styles.inputField}
                    required
                  />
                  <span className={styles.hintText}>Unique uppercase code customers enter at checkout</span>
                </div>

                {/* Coupon Type */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Coupon Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={styles.selectField}
                  >
                    <option value="Percentage">Percentage Discount</option>
                    <option value="Flat">Flat Cash Discount</option>
                  </select>
                  <span className={styles.hintText}>Select whether discount is % based or flat ₹ amount</span>
                </div>

                {/* Discount Value */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Discount Value ({formData.type === 'Percentage' ? '%' : '₹'})
                  </label>
                  <input 
                    type="number" 
                    value={formData.discountValue} 
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.type === 'Percentage' ? 'e.g. 10' : 'e.g. 500'}
                    className={styles.inputField}
                    required
                  />
                </div>

                {/* Minimum Order Amount */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Minimum Order Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.minOrder} 
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="e.g. 1500"
                    className={styles.inputField}
                  />
                </div>

                {/* Maximum Discount */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Maximum Discount (₹ cap)</label>
                  <input 
                    type="number" 
                    value={formData.maxDiscount} 
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="e.g. 1000"
                    className={styles.inputField}
                  />
                </div>

                {/* Usage Limit */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Usage Limit (Max claims)</label>
                  <input 
                    type="number" 
                    value={formData.usageLimit} 
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="e.g. 100"
                    className={styles.inputField}
                  />
                </div>

                {/* Per User Claim Limit */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Per User Claim Limit</label>
                  <input 
                    type="number" 
                    value={formData.perUserLimit} 
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    placeholder="1"
                    className={styles.inputField}
                  />
                </div>

                {/* Start Date */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start Date</label>
                  <input 
                    type="text" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="e.g. 15 Jun 2026"
                    className={styles.inputField}
                  />
                </div>

                {/* Expiry Date */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input 
                    type="text" 
                    value={formData.expiryDate} 
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="e.g. 2026-12-31"
                    className={styles.inputField}
                  />
                </div>

                {/* Active Status Row */}
                <div className={styles.toggleRow}>
                  <div className={styles.toggleTextGroup}>
                    <label className={styles.formLabel} style={{ margin: 0 }}>Active Status</label>
                    <span className={styles.hintText}>Enable or disable this coupon code instantly (Expired status is computed automatically)</span>
                  </div>
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

              {/* Form Buttons */}
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCancelForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;
