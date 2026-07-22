import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiFilter, FiDownload, FiFileText, FiPlus, FiEye, FiEdit2, 
  FiPrinter, FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiTruck, 
  FiClock, FiCheck, FiX, FiChevronDown, FiAlertCircle 
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/OrdersManagement.module.css';

function OrdersManagement() {
  const { orders, setOrders } = useAdminData();
  const navigate = useNavigate();

  // Selected active order for the right details pane
  const [selectedOrderId, setSelectedOrderId] = useState('HS10001');
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  // Right pane sub-tabs: 'details' | 'invoice' | 'timeline' | 'notes' | 'activity'
  const [activeSubTab, setActiveSubTab] = useState('details');

  // Search & Filter state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');

  // Multi select checkbox state
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Interactive dialog controls
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalType, setStatusModalType] = useState('order'); // 'order' or 'delivery'
  const [tempStatusVal, setTempStatusVal] = useState('');

  const [adminNoteText, setAdminNoteText] = useState('');

  // Synchronize admin notes input when active order changes
  useEffect(() => {
    if (activeOrder) {
      setAdminNoteText(activeOrder.adminNotes || '');
    }
  }, [activeOrder]);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState(null);
  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered and sorted orders list calculation
  const getFilteredOrders = () => {
    let list = [...orders];

    // Search query matches ID, Name, Phone, Email
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    }

    // Status filtering
    if (statusFilter !== 'All') {
      list = list.filter(o => o.orderStatus === statusFilter);
    }

    // Payment filtering
    if (paymentFilter !== 'All') {
      list = list.filter(o => o.paymentStatus === paymentFilter);
    }

    // Delivery filtering
    if (deliveryFilter !== 'All') {
      list = list.filter(o => o.deliveryStatus === deliveryFilter);
    }

    // Sorting
    if (sortOrder === 'Newest') {
      // For mock dates, sort by ID descending (HS10008 down to HS10001)
      list.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortOrder === 'Oldest') {
      list.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortOrder === 'Amount High') {
      list.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortOrder === 'Amount Low') {
      list.sort((a, b) => a.totalAmount - b.totalAmount);
    }

    return list;
  };

  const filteredOrders = getFilteredOrders();

  // Analytics helper metrics
  const totalOrdersCount = orders.length;
  const totalRevenueSum = orders
    .filter(o => o.paymentStatus === 'Paid' || o.paymentStatus === 'COD')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const averageOrderVal = totalOrdersCount > 0 ? Math.round(totalRevenueSum / totalOrdersCount) : 0;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;

  // Multi select actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkActionApply = () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one order to apply bulk actions.');
      return;
    }

    if (bulkAction === 'Print') {
      triggerToast(`Printing invoice templates for ${selectedOrderIds.length} orders...`);
      window.print();
    } else if (bulkAction === 'Export') {
      triggerToast(`Exporting data sheets for ${selectedOrderIds.length} orders to Excel/CSV...`);
    } else if (bulkAction === 'Paid') {
      setOrders(prev => prev.map(o => 
        selectedOrderIds.includes(o.id) ? { ...o, paymentStatus: 'Paid' } : o
      ));
      triggerToast(`Marked ${selectedOrderIds.length} orders payment status as Paid.`);
    } else if (bulkAction === 'Delivered') {
      setOrders(prev => prev.map(o => 
        selectedOrderIds.includes(o.id) ? { ...o, orderStatus: 'Delivered', deliveryStatus: 'Delivered' } : o
      ));
      triggerToast(`Marked ${selectedOrderIds.length} orders as Delivered.`);
    }

    setSelectedOrderIds([]);
    setBulkAction('');
  };

  // Actions for active order
  const handleStatusUpdateSave = () => {
    const updatedOrders = orders.map(o => {
      if (o.id === activeOrder.id) {
        const nextTimeline = [...o.timeline];
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        if (statusModalType === 'order') {
          // If status is Delivered, update delivery too
          const nextDeliv = tempStatusVal === 'Delivered' ? 'Delivered' : o.deliveryStatus;
          // Add timeline entry
          const exists = nextTimeline.find(t => t.status === tempStatusVal);
          if (!exists) {
            nextTimeline.push({ status: tempStatusVal, time: dateStr, completed: true });
          }
          return { 
            ...o, 
            orderStatus: tempStatusVal, 
            deliveryStatus: nextDeliv,
            timeline: nextTimeline,
            activityLog: [`Order status updated to ${tempStatusVal} by admin on ${dateStr}.`, ...o.activityLog]
          };
        } else {
          return { 
            ...o, 
            deliveryStatus: tempStatusVal,
            activityLog: [`Delivery status updated to ${tempStatusVal} by admin on ${dateStr}.`, ...o.activityLog]
          };
        }
      }
      return o;
    });

    setOrders(updatedOrders);
    setShowStatusModal(false);
    triggerToast("Status updated successfully.");
  };

  const handleRefundInitiate = () => {
    if (window.confirm(`Are you sure you want to refund order ${activeOrder.id}? This will reverse the transaction and update payment status.`)) {
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setOrders(prev => prev.map(o => 
        o.id === activeOrder.id 
          ? { 
              ...o, 
              paymentStatus: 'Refunded', 
              orderStatus: 'Refunded',
              activityLog: [`Refund of ₹${o.totalAmount} approved by admin on ${dateStr}.`, ...o.activityLog]
            } 
          : o
      ));
      triggerToast("Refund approved. Payment marked as Refunded.");
    }
  };

  const handleCancelOrder = () => {
    if (window.confirm(`Are you sure you want to cancel order ${activeOrder.id}? This will halt shipping processes.`)) {
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      setOrders(prev => prev.map(o => 
        o.id === activeOrder.id 
          ? { 
              ...o, 
              orderStatus: 'Cancelled', 
              deliveryStatus: 'Cancelled',
              activityLog: [`Order cancelled by admin on ${dateStr}.`, ...o.activityLog]
            } 
          : o
      ));
      triggerToast("Order cancelled.");
    }
  };

  const handleNotifyCustomer = () => {
    triggerToast(`Notification email & SMS sent to ${activeOrder.customerName} (${activeOrder.customerPhone}) successfully.`);
  };

  const handleSaveNotes = () => {
    setOrders(prev => prev.map(o => 
      o.id === activeOrder.id 
        ? { ...o, adminNotes: adminNoteText } 
        : o
    ));
    triggerToast("Admin notes updated.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.wrapper}>
      {toastMsg && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMsg}
        </div>
      )}

      {/* Update Status Overlay Modal Dialog */}
      {showStatusModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.statusModal}>
            <div className={styles.modalHeader}>
              <h4>Update {statusModalType === 'order' ? 'Order' : 'Delivery'} Status</h4>
              <button onClick={() => setShowStatusModal(false)} className={styles.modalCloseBtn}><FiX /></button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '12.5px', color: '#666666', marginBottom: '14px' }}>
                Select the new status code for order <strong>{activeOrder.id}</strong>.
              </p>
              
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#2b2b2b' }}>Choose Status</label>
              {statusModalType === 'order' ? (
                <select 
                  value={tempStatusVal} 
                  onChange={(e) => setTempStatusVal(e.target.value)}
                  className={styles.modalSelect}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                  <option value="Refunded">Refunded</option>
                </select>
              ) : (
                <select 
                  value={tempStatusVal} 
                  onChange={(e) => setTempStatusVal(e.target.value)}
                  className={styles.modalSelect}
                >
                  <option value="Not Processed">Not Processed</option>
                  <option value="Ready to Ship">Ready to Ship</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className={styles.modalSaveBtn} onClick={handleStatusUpdateSave}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title Row */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Orders Management</h2>
          <p className={styles.desc}>Dashboard &gt; Orders</p>
        </div>
      </div>

      {/* Analytics Statistics Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Orders</span>
          <h3 className={styles.statValue}>{totalOrdersCount}</h3>
          <span className={styles.statTrendUp}>+ 12.5% from last month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue</span>
          <h3 className={styles.statValue}>₹{totalRevenueSum.toLocaleString('en-IN')}</h3>
          <span className={styles.statTrendUp}>+ 18.7% from last month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Average Order Value</span>
          <h3 className={styles.statValue}>₹{averageOrderVal.toLocaleString('en-IN')}</h3>
          <span className={styles.statTrendUp}>+ 8.3% from last month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Pending Orders</span>
          <h3 className={styles.statValue} style={{ color: '#ffb300' }}>{pendingOrdersCount}</h3>
          <span className={styles.statTrendDown}>- 3.2% from last month</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Delivered Orders</span>
          <h3 className={styles.statValue} style={{ color: '#2e7d32' }}>{deliveredOrdersCount}</h3>
          <span className={styles.statTrendUp}>+ 22.1% from last month</span>
        </div>
      </div>

      {/* Charts & Analytical Overviews */}
      <div className={styles.analyticsSection}>
        <div className={styles.chartBlockCard}>
          <h4>Orders Overview</h4>
          <p style={{ fontSize: '11px', color: '#999999', marginBottom: '14px' }}>Monthly sales order count progression</p>
          <div className={styles.mockBarChart}>
            <div className={styles.chartBar} style={{ height: '30%' }}><span className={styles.barTooltip}>May 01 (10)</span></div>
            <div className={styles.chartBar} style={{ height: '45%' }}><span className={styles.barTooltip}>May 03 (15)</span></div>
            <div className={styles.chartBar} style={{ height: '70%' }}><span className={styles.barTooltip}>May 05 (24)</span></div>
            <div className={styles.chartBar} style={{ height: '35%' }}><span className={styles.barTooltip}>May 07 (12)</span></div>
            <div className={styles.chartBar} style={{ height: '85%' }}><span className={styles.barTooltip}>May 09 (30)</span></div>
            <div className={styles.chartBar} style={{ height: '55%' }}><span className={styles.barTooltip}>May 11 (18)</span></div>
            <div className={styles.chartBar} style={{ height: '90%' }}><span className={styles.barTooltip}>May 13 (32)</span></div>
            <div className={styles.chartBar} style={{ height: '60%' }}><span className={styles.barTooltip}>May 15 (20)</span></div>
          </div>
          <div className={styles.chartXLabels}>
            <span>01 May</span>
            <span>05 May</span>
            <span>09 May</span>
            <span>13 May</span>
          </div>
        </div>

        <div className={styles.chartBlockCard}>
          <h4>Top Payment Methods</h4>
          <p style={{ fontSize: '11px', color: '#999999', marginBottom: '20px' }}>Split ratio by payment transaction counts</p>
          <div className={styles.progressRow}>
            <div className={styles.progressLabel}>
              <span>Razorpay (Online Card/NetBanking)</span>
              <strong>72%</strong>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarFill} style={{ width: '72%', backgroundColor: '#d11b69' }} />
            </div>
          </div>
          <div className={styles.progressRow}>
            <div className={styles.progressLabel}>
              <span>Cash on Delivery (COD)</span>
              <strong>18%</strong>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarFill} style={{ width: '18%', backgroundColor: '#ffb300' }} />
            </div>
          </div>
          <div className={styles.progressRow}>
            <div className={styles.progressLabel}>
              <span>UPI Payments</span>
              <strong>10%</strong>
            </div>
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBarFill} style={{ width: '10%', backgroundColor: '#2e7d32' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className={styles.workspaceGrid}>
        
        {/* Left Hand: Orders list table */}
        <div className={styles.listContainer}>
          <div className={styles.tableHeaderBar}>
            <div>
              <h3>Orders Directory</h3>
              <p style={{ fontSize: '12px', color: '#666666' }}>Curation checklist of all order invoices</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={styles.excelBtn} 
                onClick={() => {
                  if (!filteredOrders || filteredOrders.length === 0) {
                    triggerToast("No orders to export.");
                    return;
                  }
                  const headers = ['Order ID', 'Customer Name', 'Email', 'Phone', 'Total Amount (INR)', 'Payment Status', 'Order Status', 'Date'];
                  const rows = filteredOrders.map(o => [
                    o.id,
                    `"${(o.customerName || '').replace(/"/g, '""')}"`,
                    `"${o.customerEmail || ''}"`,
                    `"${o.customerPhone || ''}"`,
                    o.totalAmount || 0,
                    o.paymentStatus || '',
                    o.orderStatus || '',
                    `"${o.orderDate || ''}"`
                  ]);
                  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  triggerToast("Orders directory exported successfully to CSV!");
                }}
              >
                Export Excel
              </button>
              <button 
                className={styles.pdfBtn} 
                onClick={() => {
                  if (!activeOrder) {
                    triggerToast("No active order selected.");
                    return;
                  }
                  window.print();
                }}
              >
                Print Invoice
              </button>
              <button className={styles.createBtn} onClick={() => triggerToast("Order creator module is locked for integration.")}>+ Create Order</button>
            </div>
          </div>

          {/* Search bar & filter controls */}
          <div className={styles.filterRow}>
            <div className={styles.searchBox}>
              <FiSearch />
              <input 
                type="text" 
                placeholder="Search Order ID, customer name, phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterSelects}>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>

              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="COD">COD</option>
                <option value="Pending">Pending</option>
                <option value="Refunded">Refunded</option>
              </select>

              <select value={deliveryFilter} onChange={(e) => setDeliveryFilter(e.target.value)}>
                <option value="All">All Delivery</option>
                <option value="Not Processed">Not Processed</option>
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Bulk actions controls */}
          {selectedOrderIds.length > 0 && (
            <div className={styles.bulkActionBar}>
              <span>{selectedOrderIds.length} orders selected</span>
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
                <option value="">Bulk Actions</option>
                <option value="Paid">Mark as Paid</option>
                <option value="Delivered">Mark as Delivered</option>
                <option value="Print">Print Invoices</option>
                <option value="Export">Export Details</option>
              </select>
              <button onClick={handleBulkActionApply} className={styles.bulkApplyBtn}>Apply</button>
            </div>
          )}

          {/* Orders Table rendering */}
          <div className={styles.tableResponsive}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length} 
                    />
                  </th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => {
                    const isSelected = selectedOrderId === order.id;
                    const itemsCount = order.products.reduce((sum, p) => sum + p.qty, 0);
                    return (
                      <tr 
                        key={order.id} 
                        className={`${isSelected ? styles.tableRowSelected : ''}`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={(e) => handleSelectOne(order.id, e.target.checked)} 
                          />
                        </td>
                        <td>
                          <span className={styles.orderIdText}>{order.id}</span>
                        </td>
                        <td>
                          <div className={styles.customerInfoBlock}>
                            <strong>{order.customerName}</strong>
                            <span>{order.customerPhone}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.thumbsWrapper}>
                            {order.products.slice(0, 2).map((p, idx) => (
                              <img key={idx} src={p.image} alt={p.name} className={styles.tinyThumbImg} />
                            ))}
                            {order.products.length > 2 && (
                              <span className={styles.extraItemsPill}>+{order.products.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#2b2b2b' }}>₹{order.totalAmount.toLocaleString('en-IN')}</strong>
                        </td>
                        <td>
                          <div className={styles.paymentStatusWrapper}>
                            <span className={styles.methodText}>{order.paymentMethod}</span>
                            <span className={`${styles.statusPill} ${styles['payment_' + order.paymentStatus.toLowerCase()]}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['order_' + order.orderStatus.toLowerCase().replace(/\s+/g, '_')]}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['delivery_' + order.deliveryStatus.toLowerCase().replace(/\s+/g, '_')]}`}>
                            {order.deliveryStatus}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#666666' }}>{order.orderDate.split(',')[0]}</span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <button className={styles.rowBtn} onClick={() => setSelectedOrderId(order.id)} title="View Details">
                            <FiEye />
                          </button>
                          <button 
                            className={styles.rowBtn} 
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setTempStatusVal(order.orderStatus);
                              setStatusModalType('order');
                              setShowStatusModal(true);
                            }} 
                            title="Update Status"
                          >
                            <FiEdit2 />
                          </button>
                          <button className={styles.rowBtn} onClick={() => {
                            setSelectedOrderId(order.id);
                            setActiveSubTab('invoice');
                          }} title="Print Invoice">
                            <FiPrinter />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#999999' }}>
                      <FiAlertCircle style={{ fontSize: '24px', marginBottom: '8px', color: '#d11b69' }} />
                      <p>No orders match search filter parameters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Hand: Selected Order Details Console */}
        <div className={styles.detailPane}>
          {activeOrder ? (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Order Details</h4>
                  <span className={styles.orderIdSub}>#{activeOrder.id}</span>
                </div>
                <button className={styles.closePaneBtn} onClick={() => triggerToast("Selected order panel stays anchored.")}><FiX /></button>
              </div>

              {/* Detail pane tabs */}
              <div className={styles.detailTabs}>
                <button className={`${styles.detailTabBtn} ${activeSubTab === 'details' ? styles.detailTabActive : ''}`} onClick={() => setActiveSubTab('details')}>Details</button>
                <button className={`${styles.detailTabBtn} ${activeSubTab === 'invoice' ? styles.detailTabActive : ''}`} onClick={() => setActiveSubTab('invoice')}>Invoice</button>
                <button className={`${styles.detailTabBtn} ${activeSubTab === 'timeline' ? styles.detailTabActive : ''}`} onClick={() => setActiveSubTab('timeline')}>Timeline</button>
                <button className={`${styles.detailTabBtn} ${activeSubTab === 'notes' ? styles.detailTabActive : ''}`} onClick={() => setActiveSubTab('notes')}>Notes</button>
              </div>

              {/* Subtab Content: DETAILS */}
              {activeSubTab === 'details' && (
                <div className={styles.tabContentPanel}>
                  
                  {/* Customer details info */}
                  <div className={styles.infoSection}>
                    <h5 className={styles.sectionHeading}><FiUser /> Customer Information</h5>
                    <div className={styles.infoCard}>
                      <strong>{activeOrder.customerName}</strong>
                      <div className={styles.infoRow}><FiMail /> <span>{activeOrder.customerEmail}</span></div>
                      <div className={styles.infoRow}><FiPhone /> <span>{activeOrder.customerPhone}</span></div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className={styles.addressSectionGrid}>
                    <div className={styles.infoSection}>
                      <h5 className={styles.sectionHeading}><FiMapPin /> Shipping Address</h5>
                      <div className={styles.addressCard}>
                        <p>{activeOrder.shippingAddress}</p>
                        <span className={styles.addressTag}>Default</span>
                      </div>
                    </div>
                    <div className={styles.infoSection}>
                      <h5 className={styles.sectionHeading}><FiMapPin /> Billing Address</h5>
                      <div className={styles.addressCard}>
                        <p>{activeOrder.billingAddress}</p>
                        <span className={styles.addressTag}>Default</span>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Products line items */}
                  <div className={styles.infoSection}>
                    <h5 className={styles.sectionHeading}>Ordered Products ({activeOrder.products.length} Items)</h5>
                    <div className={styles.productsList}>
                      {activeOrder.products.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <img src={item.image} alt={item.name} className={styles.itemThumb} />
                          <div style={{ flex: 1 }}>
                            <strong className={styles.itemNameText}>{item.name}</strong>
                            <div className={styles.itemMetaText}>SKU: {item.sku} | Fabric: {item.fabric}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700 }}>₹{item.total}</div>
                            <div style={{ fontSize: '11px', color: '#888888' }}>Qty: {item.qty}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Invoice math summary */}
                    <div className={styles.totalsSummaryBox}>
                      <div className={styles.totalSumRow}><span>Subtotal</span><span>₹{activeOrder.subtotal}</span></div>
                      <div className={styles.totalSumRow}><span>Discount</span><span>-₹{activeOrder.discount}</span></div>
                      <div className={styles.totalSumRow}><span>Shipping</span><span>₹{activeOrder.shipping}</span></div>
                      <div className={styles.totalSumRow}><span>GST (5%)</span><span>₹{activeOrder.gst}</span></div>
                      <div className={`${styles.totalSumRow} ${styles.totalGrandRow}`}><span>Grand Total</span><span>₹{activeOrder.totalAmount}</span></div>
                    </div>
                  </div>

                  {/* Payment & Delivery blocks */}
                  <div className={styles.shippingDetailGrid}>
                    <div className={styles.infoSection}>
                      <h5 className={styles.sectionHeading}><FiCreditCard /> Payment</h5>
                      <div className={styles.infoCard}>
                        <div className={styles.metaLabelVal}><span>Method:</span><strong>{activeOrder.paymentMethod}</strong></div>
                        <div className={styles.metaLabelVal}><span>Status:</span><span className={`${styles.statusPill} ${styles['payment_' + activeOrder.paymentStatus.toLowerCase()]}`}>{activeOrder.paymentStatus}</span></div>
                        <div className={styles.metaLabelVal}><span>TXN ID:</span><span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{activeOrder.transactionId}</span></div>
                      </div>
                    </div>

                    <div className={styles.infoSection}>
                      <h5 className={styles.sectionHeading}><FiTruck /> Delivery</h5>
                      <div className={styles.infoCard}>
                        <div className={styles.metaLabelVal}><span>Courier:</span><strong>{activeOrder.courier}</strong></div>
                        <div className={styles.metaLabelVal}><span>AWB / Track:</span><strong>{activeOrder.trackingNumber}</strong></div>
                        <div className={styles.metaLabelVal}><span>Dispatch:</span><span>{activeOrder.dispatchDate}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline Checklist */}
                  <div className={styles.infoSection}>
                    <h5 className={styles.sectionHeading}><FiClock /> Order Status Timeline</h5>
                    <div className={styles.horizontalTimeline}>
                      {activeOrder.timeline.map((step, idx) => (
                        <div key={idx} className={`${styles.timelineStep} ${step.completed ? styles.timelineStepDone : ''}`}>
                          <div className={styles.stepCircle}>
                            {step.completed ? <FiCheck /> : <FiClock />}
                          </div>
                          <span className={styles.stepName}>{step.status}</span>
                          <span className={styles.stepTime}>{step.time !== '-' ? step.time.split(',')[0] : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Administrative Action Control buttons */}
                  <div className={styles.actionsPanel}>
                    <h5 className={styles.sectionHeading}>Admin Console Actions</h5>
                    <div className={styles.adminConsoleGrid}>
                      <button className={styles.actionBtn} onClick={() => {
                        setTempStatusVal(activeOrder.orderStatus);
                        setStatusModalType('order');
                        setShowStatusModal(true);
                      }}>Update Status</button>
                      <button 
                        className={styles.actionBtn} 
                        disabled={activeOrder.paymentStatus === 'Refunded'} 
                        onClick={handleRefundInitiate}
                      >
                        Refund
                      </button>
                      <button 
                        className={styles.actionBtnCancel} 
                        disabled={activeOrder.orderStatus === 'Cancelled'} 
                        onClick={handleCancelOrder}
                      >
                        Cancel Order
                      </button>
                      <button className={styles.actionBtn} onClick={handleNotifyCustomer}>Notify Customer</button>
                    </div>
                  </div>

                </div>
              )}

              {/* Subtab Content: PREMIUM INVOICE */}
              {activeSubTab === 'invoice' && (
                <div className={styles.tabContentPanel}>
                  <div className={styles.invoiceFrame} id="printable-invoice-element">
                    {/* Invoice header store info */}
                    <div className={styles.invoiceTopRow}>
                      <div>
                        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#d11b69', margin: 0, fontSize: '20px' }}>HAPPY SAREES</h2>
                        <span style={{ fontSize: '11px', color: '#999999' }}>Luxury Heritage Handlooms</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: 0, fontSize: '14px' }}>INVOICE</h3>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2b2b2b' }}>#{activeOrder.id}</span>
                      </div>
                    </div>

                    <div className={styles.invoiceAddressGrid}>
                      <div>
                        <strong>Sender:</strong>
                        <p style={{ fontSize: '11px', color: '#666666', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                          Happy Sarees Handloom Co.<br />
                          Heritage Loom Tower, Section 4<br />
                          Kanchipuram, Tamil Nadu - 631501
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Bill To:</strong>
                        <p style={{ fontSize: '11px', color: '#666666', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                          {activeOrder.customerName}<br />
                          {activeOrder.shippingAddress.substring(0, 40)}...<br />
                          Phone: {activeOrder.customerPhone}
                        </p>
                      </div>
                    </div>

                    {/* Table row list */}
                    <table className={styles.invoiceItemTable}>
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th style={{ textAlign: 'center' }}>Qty</th>
                          <th style={{ textAlign: 'right' }}>Price</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrder.products.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.name}</td>
                            <td>{item.sku}</td>
                            <td style={{ textAlign: 'center' }}>{item.qty}</td>
                            <td style={{ textAlign: 'right' }}>₹{item.price}</td>
                            <td style={{ textAlign: 'right' }}>₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className={styles.invoiceBottomGrid}>
                      <div style={{ fontSize: '11px', color: '#888888', fontStyle: 'italic' }}>
                        * Tax Invoice generated electronically. No signature required.
                      </div>
                      <div className={styles.invoiceMathBlock}>
                        <div><span>Subtotal</span><span>₹{activeOrder.subtotal}</span></div>
                        <div><span>GST (5%)</span><span>₹{activeOrder.gst}</span></div>
                        <div><span>Shipping</span><span>₹{activeOrder.shipping}</span></div>
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '8px', fontSize: '13px', fontWeight: 'bold', color: '#2b2b2b' }}>
                          <span>Grand Total</span><span>₹{activeOrder.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Print and Save triggers */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className={styles.invoiceControlBtn} onClick={handlePrint}>
                      <FiPrinter /> Print Invoice
                    </button>
                    <button className={styles.invoiceControlBtn} onClick={() => triggerToast("Invoices downloaded as PDF document.")}>
                      <FiDownload /> Download PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Subtab Content: TIMELINE */}
              {activeSubTab === 'timeline' && (
                <div className={styles.tabContentPanel}>
                  <div className={styles.timelineList}>
                    {activeOrder.timeline.map((step, idx) => (
                      <div key={idx} className={styles.logItem}>
                        <div className={`${styles.logCircle} ${step.completed ? styles.logCircleDone : ''}`} />
                        <div>
                          <strong style={{ fontSize: '12.5px' }}>{step.status}</strong>
                          <p style={{ fontSize: '11px', color: '#888888', margin: '2px 0 0 0' }}>{step.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab Content: STAFF NOTES */}
              {activeSubTab === 'notes' && (
                <div className={styles.tabContentPanel}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#2b2b2b' }}>Internal Staff Notes</label>
                  <textarea 
                    value={adminNoteText} 
                    onChange={(e) => setAdminNoteText(e.target.value)} 
                    placeholder="Enter private notes about loom assignment, shipment packaging, etc..."
                    rows={4}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12.5px', marginTop: '6px' }}
                  />
                  <button className={styles.saveNotesBtn} onClick={handleSaveNotes}>
                    Save Notes
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999999' }}>
              Select an order from the directory list to display details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrdersManagement;
