import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiFilter, FiDownload, FiPlus, FiEye, FiTrash2, 
  FiMail, FiPhone, FiMapPin, FiX, FiCheck, FiAlertCircle, FiRefreshCw 
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/Customers.module.css';

function Customers() {
  const { customers, setCustomers, refreshCustomers } = useAdminData();

  // Refresh live customers list from Neon PostgreSQL DB on page load
  useEffect(() => {
    if (refreshCustomers) {
      refreshCustomers();
    }
  }, []);

  // Selected customer for detail sidebar (null by default until View Eye icon is clicked)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const activeCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [customerFilter, setCustomerFilter] = useState('All');

  // Customer edit/create popup details
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'Active',
    notes: '',
    totalOrders: 0,
    totalSpent: 0,
    joinedDate: '',
    avatar: ''
  });

  // Local state for selected customer notes
  const [localNote, setLocalNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  React.useEffect(() => {
    if (activeCustomer) {
      setLocalNote(activeCustomer.notes || '');
      setIsEditingNote(false);
    }
  }, [activeCustomer]);

  // Toast alert
  const [toastMsg, setToastMsg] = useState(null);
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filter list calculation
  const getFilteredCustomers = () => {
    let list = [...customers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }

    if (statusFilter !== 'All') {
      list = list.filter(c => c.status === statusFilter);
    }

    if (customerFilter !== 'All') {
      if (customerFilter === 'New') {
        list = list.filter(c => c.totalOrders <= 2);
      } else if (customerFilter === 'Returning') {
        list = list.filter(c => c.totalOrders > 2);
      }
    }

    return list;
  };

  const filteredCustomers = getFilteredCustomers();

  // Save notes handler
  const handleSaveNotes = () => {
    setCustomers(prev => prev.map(c => 
      c.id === activeCustomer.id ? { ...c, notes: localNote } : c
    ));
    setIsEditingNote(false);
    triggerToast("Notes updated successfully.");
  };

  // Toggle status (Active / Blocked) in details panel
  const handleToggleStatus = async (checked) => {
    const nextStatus = checked ? 'Active' : 'Blocked';
    try {
      const token = localStorage.getItem('hs_admin_token');
      if (token && activeCustomer.id) {
        await fetch(`http://localhost:5001/api/admin/customers/${activeCustomer.id}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            action: checked ? 'unblock' : 'block',
            reason: checked ? '' : 'Blocked by Admin from Customers Directory'
          })
        });
      }
    } catch (err) {
      console.warn('[Customers] Status sync error:', err.message);
    }
    setCustomers(prev => prev.map(c => 
      c.id === activeCustomer.id ? { ...c, status: nextStatus, isBlocked: !checked } : c
    ));
    triggerToast(`Customer ${activeCustomer.name} marked as ${nextStatus}.`);
  };

  // Delete customer dynamically from Neon Cloud PostgreSQL Database
  const handleDeleteCustomer = async (cust) => {
    if (!cust) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete customer account "${cust.name}" (${cust.email})? This action will permanently remove the record from Neon Cloud PostgreSQL Database.`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/customers/${cust.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'delete' })
      });
    } catch (err) {
      console.warn('[Customers] Delete sync error:', err.message);
    }

    setCustomers(prev => prev.filter(c => c.id !== cust.id));
    if (selectedCustomerId === cust.id) {
      setSelectedCustomerId(null);
    }
    triggerToast(`Customer "${cust.name}" permanently deleted from database.`);
  };

  // Real CSV Export Handler
  const handleExportCustomers = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      triggerToast("No customer data to export.");
      return;
    }
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Total Orders', 'Total Spent (INR)', 'Status', 'Joined Date'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      c.totalOrders || 0,
      c.totalSpent || 0,
      c.status || 'Active',
      `"${c.joinedDate || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Customer directory exported successfully to CSV!");
  };

  const handleOpenAddModal = () => {
    setFormData({
      id: null,
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active',
      notes: '',
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: '',
      avatar: ''
    });
    setModalMode('add');
    setShowAddEditModal(true);
  };

  return (
    <div className={styles.wrapper}>
      {toastMsg && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMsg}
        </div>
      )}





      {/* Split screen content grid */}
      <div className={`${styles.contentGrid} ${activeCustomer ? styles.contentGridHasPanel : ''}`}>
        
        {/* Left Column: Customer table Directory */}
        <div className={styles.leftColumn}>
          <div className={styles.cardHeaderBar}>
            <h3>Registered Customer Accounts</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.exportBtn} onClick={() => { refreshCustomers(); triggerToast("Refreshed live customers from Neon DB."); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiRefreshCw /> Refresh
              </button>
              <button className={styles.exportBtn} onClick={handleExportCustomers}>Export</button>
            </div>
          </div>

          {/* Filtering bar */}
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <FiSearch />
              <input 
                type="text" 
                placeholder="Search by name, email or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className={styles.filterSelects}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>

              <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
                <option value="All">All Customers</option>
                <option value="New">New Customers</option>
                <option value="Returning">Returning Customers</option>
              </select>
            </div>
          </div>

          {/* Table Grid */}
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(cust => {
                    const isSelected = selectedCustomerId === cust.id;
                    return (
                      <tr 
                        key={cust.id} 
                        className={isSelected ? styles.rowSelected : ''}
                        onClick={() => setSelectedCustomerId(cust.id)}
                      >
                        <td>
                          <div className={styles.profileCell}>
                            {cust.avatar && !cust.avatar.includes('unsplash.com') ? (
                              <img src={cust.avatar} alt={cust.name} className={styles.tableAvatar} />
                            ) : (
                              <div className={styles.initialAvatar}>
                                {(cust.name || 'C').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <strong>{cust.name}</strong>
                          </div>
                        </td>
                        <td>{cust.email}</td>
                        <td>{cust.phone}</td>
                        <td>{cust.totalOrders}</td>
                        <td><strong>₹{cust.totalSpent.toLocaleString('en-IN')}</strong></td>
                        <td>
                          <span className={`${styles.statusBadge} ${cust.status === 'Active' ? styles.statusActive : styles.statusBlocked}`}>
                            {cust.status}
                          </span>
                        </td>
                        <td>{cust.joinedDate}</td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <button className={`${styles.rowBtn} ${styles.viewBtn}`} onClick={() => setSelectedCustomerId(cust.id)} title="View Details">
                            <FiEye />
                          </button>
                          <button className={`${styles.rowBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteCustomer(cust)} title="Delete Customer Account">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                      <FiAlertCircle style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--primary-color)' }} />
                      <p>No customers match the active filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Centered Customer Details Modal Overlay (Triggered by Eye icon click) */}
        {activeCustomer && (
          <div className={styles.modalOverlay} onClick={() => setSelectedCustomerId(null)}>
            <div className={styles.modal} style={{ maxWidth: '520px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h4>Customer Details</h4>
                <button className={styles.closeBtn} onClick={() => setSelectedCustomerId(null)} title="Close Details"><FiX /></button>
              </div>

              <div className={styles.modalBody}>
                {/* Central avatar photo */}
                <div className={styles.profileSection}>
                  <img src={activeCustomer.avatar} alt={activeCustomer.name} className={styles.largeAvatar} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 className={styles.profileName}>{activeCustomer.name}</h3>
                      <span className={`${styles.statusBadge} ${activeCustomer.status === 'Active' ? styles.statusActive : styles.statusBlocked}`}>
                        {activeCustomer.status}
                      </span>
                    </div>
                    <div className={styles.profileMeta}><FiMail /> <span>{activeCustomer.email}</span></div>
                    <div className={styles.profileMeta}><FiPhone /> <span>{activeCustomer.phone}</span></div>
                  </div>
                </div>

                {/* Spent parameters */}
                <div className={styles.spentGrid}>
                  <div className={styles.spentCard}>
                    <span>Total Orders</span>
                    <strong>{activeCustomer.totalOrders}</strong>
                    <span className={styles.trendTextUp}>{activeCustomer.ordersTrend}</span>
                  </div>
                  <div className={styles.spentCard}>
                    <span>Total Spent</span>
                    <strong>₹{activeCustomer.totalSpent.toLocaleString('en-IN')}</strong>
                    <span className={styles.trendTextUp}>{activeCustomer.spentTrend}</span>
                  </div>
                </div>

                {/* Shipping address info */}
                <div className={styles.infoBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h5>Default Address</h5>
                    <span className={styles.actionLinkText}>View All</span>
                  </div>
                  <div className={styles.addressBox}>
                    <FiMapPin />
                    <p>{activeCustomer.address}</p>
                  </div>
                </div>

                {/* Last order info */}
                {activeCustomer.lastOrder ? (
                  <div className={styles.infoBlock}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h5>Last Order</h5>
                      <span className={styles.actionLinkText}>View Orders</span>
                    </div>
                    <div className={styles.orderSummaryBox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>ID: {activeCustomer.lastOrder.id}</strong>
                        <span className={styles.orderDeliveredBadge}>{activeCustomer.lastOrder.status}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#666' }}>
                        <span>Date: {activeCustomer.lastOrder.date}</span>
                        <strong>Amount: ₹{activeCustomer.lastOrder.amount}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.infoBlock}>
                    <h5>Last Order</h5>
                    <div className={styles.orderSummaryBox} style={{ fontStyle: 'italic', color: '#999', fontSize: '12px' }}>
                      No orders placed yet.
                    </div>
                  </div>
                )}

                {/* Notes block */}
                <div className={styles.infoBlock}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h5>Notes</h5>
                    {isEditingNote ? (
                      <button className={styles.notesSaveBtn} onClick={handleSaveNotes}>Save</button>
                    ) : (
                      <button className={styles.notesEditBtn} onClick={() => setIsEditingNote(true)}>Edit</button>
                    )}
                  </div>
                  {isEditingNote ? (
                    <textarea 
                      value={localNote} 
                      onChange={(e) => setLocalNote(e.target.value)} 
                      rows={3} 
                      className={styles.notesTextarea}
                    />
                  ) : (
                    <div className={styles.notesBox}>
                      {activeCustomer.notes || 'No custom annotations.'}
                    </div>
                  )}
                </div>

                {/* Toggle switch for customer status */}
                <div className={styles.statusToggleRow}>
                  <span>Customer Active Status</span>
                  <label className={styles.switchLabel}>
                    <input 
                      type="checkbox" 
                      checked={activeCustomer.status === 'Active'}
                      onChange={(e) => handleToggleStatus(e.target.checked)} 
                    />
                    <span className={styles.switchSlider} />
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className={styles.modalFooter} style={{ justifyContent: 'space-between' }}>
                <button className={styles.editBtnAction} onClick={() => handleDeleteCustomer(activeCustomer)} style={{ color: 'var(--error-color)', borderColor: '#ffcdd2', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <FiTrash2 /> Delete Account
                </button>
                <button className={styles.modalCancelBtn} onClick={() => setSelectedCustomerId(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Customers;
