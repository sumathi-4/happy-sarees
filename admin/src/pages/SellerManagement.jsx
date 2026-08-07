import React, { useEffect, useState } from 'react';
import { 
  FiSearch, FiEye, FiAlertOctagon, FiCheckSquare, FiX, FiFileText, 
  FiBriefcase, FiShoppingBag, FiLayers, FiMapPin, FiActivity 
} from 'react-icons/fi';
import { sellersApi } from '../api/adminApi';
import styles from '../styles/SellerManagement.module.css';

function SellerManagement() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected seller for drawer
  const [selectedId, setSelectedId] = useState(null);
  const activeSeller = selectedId ? sellers.find(s => s.id === selectedId) : null;

  // Suspension modal
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendId, setSuspendId] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Sub-modal drill-ins
  const [drillModalMode, setDrillModalMode] = useState(null); // 'products' or 'orders'
  const [drillItems, setDrillItems] = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);

  async function loadSellers() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await sellersApi.getAll(params);
      if (res.success) {
        setSellers(res.sellers);
      } else {
        setErrorMsg('Failed to load seller roster.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSellers();
  }, [search, statusFilter]);

  const handleReactivate = async (id, name) => {
    if (window.confirm(`Are you sure you want to REACTIVATE the seller store "${name}"?`)) {
      try {
        const res = await sellersApi.unsuspend(id);
        if (res.success) {
          alert(`Seller "${name}" reactivated successfully. Their public listings are now visible.`);
          loadSellers();
        }
      } catch (err) {
        alert(err.message || 'Failed to reactivate.');
      }
    }
  };

  const openSuspendModal = (id) => {
    setSuspendId(id);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const handleSuspendSubmit = async () => {
    if (!suspendReason.trim()) {
      alert('Please specify a suspension reason for vendor compliance records.');
      return;
    }
    const name = sellers.find(s => s.id === suspendId)?.storeName || 'Seller';
    try {
      const res = await sellersApi.suspend(suspendId, { reason: suspendReason });
      if (res.success) {
        alert(`Seller "${name}" store has been suspended. Public listings hidden.`);
        setShowSuspendModal(false);
        loadSellers();
      }
    } catch (err) {
      alert(err.message || 'Failed to suspend store.');
    }
  };

  // Drill-in loaders
  const openDrillProducts = async (sellerId) => {
    setDrillModalMode('products');
    setDrillLoading(true);
    setDrillItems([]);
    try {
      const res = await sellersApi.getProducts(sellerId);
      if (res.success) {
        setDrillItems(res.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrillLoading(false);
    }
  };

  const openDrillOrders = async (sellerId) => {
    setDrillModalMode('orders');
    setDrillLoading(true);
    setDrillItems([]);
    try {
      const res = await sellersApi.getOrders(sellerId);
      if (res.success) {
        setDrillItems(res.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrillLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className={`${styles.badge} ${styles.badgeApproved}`}>Approved</span>;
      case 'pending': return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Verification</span>;
      case 'rejected': return <span className={`${styles.badge} ${styles.badgeRejected}`}>Rejected</span>;
      case 'suspended': return <span className={`${styles.badge} ${styles.badgeSuspended}`}>Suspended</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Registry</h1>
          <p className={styles.desc}>Manage registered saree boutique weavers, suspension overrides, and review order settlements.</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      <div className={`${styles.contentGrid} ${activeSeller ? styles.contentGridHasPanel : ''}`}>
        
        {/* Left Column: Sellers list table */}
        <div className={styles.leftColumn}>
          <div className={styles.cardHeaderBar}>
            <h3>Registered Sellers ({sellers.length})</h3>
            <div className={styles.filterControls}>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search store name, category..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.value || e.target.value)}
                />
              </div>

              <select 
                className={styles.selectFilter}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>Loading seller files...</div>
            ) : sellers.length === 0 ? (
              <div className={styles.empty}>
                No registered vendors found matching filters.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Store Profile</th>
                    <th className={styles.th}>Owner Name</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Products</th>
                    <th className={styles.th}>Orders</th>
                    <th className={styles.th}>Verification Status</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map(s => (
                    <tr key={s.id} className={`${styles.tr} ${selectedId === s.id ? styles.trActive : ''}`}>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           {s.storeLogoUrl ? (
                            <img src={s.storeLogoUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                              {(s.storeName || '').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{s.storeName}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className={styles.td}>{s.ownerName}</td>
                      <td className={styles.td} style={{ textTransform: 'capitalize' }}>{s.businessCategory || 'N/A'}</td>
                      <td className={styles.td}>
                        <button 
                          className={styles.link}
                          style={{ background: 'none', border: 'none', padding: 0, fontStyle: 'italic', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary-color)' }}
                          onClick={() => openDrillProducts(s.id)}
                        >
                          {s.productsCount || 0} Listed
                        </button>
                      </td>
                      <td className={styles.td}>
                        <button 
                          className={styles.link}
                          style={{ background: 'none', border: 'none', padding: 0, fontStyle: 'italic', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary-color)' }}
                          onClick={() => openDrillOrders(s.id)}
                        >
                          {s.ordersCount || 0} Orders
                        </button>
                      </td>
                      <td className={styles.td}>{getStatusBadge(s.status)}</td>
                      <td className={styles.td} style={{ textAlign: 'right' }}>
                        <div className={styles.actionIconGroup} style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className={`${styles.iconBtn} ${styles.iconBtnView}`}
                            onClick={() => setSelectedId(s.id)}
                            title="Audit Store Profile"
                          >
                            <FiEye />
                          </button>
                          {s.status === 'approved' && (
                            <button 
                              className={`${styles.iconBtn} ${styles.iconBtnReject}`}
                              onClick={() => openSuspendModal(s.id)}
                              title="Suspend Vendor Store"
                            >
                              <FiAlertOctagon />
                            </button>
                          )}
                          {s.status === 'suspended' && (
                            <button 
                              className={`${styles.iconBtn} ${styles.iconBtnApprove}`}
                              onClick={() => handleReactivate(s.id, s.storeName)}
                              title="Reactivate Vendor"
                            >
                              <FiCheckSquare />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Seller Detail Dossier */}
        {activeSeller && (
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <h3>Boutique Studio Dossier</h3>
              </div>
              <button className={styles.iconBtn} onClick={() => setSelectedId(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.panelBody}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                {activeSeller.storeLogoUrl ? (
                  <img src={activeSeller.storeLogoUrl} alt={activeSeller.storeName} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--gold-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                    {(activeSeller.storeName || '').charAt(0).toUpperCase()}
                  </div>
                )}
                <h4 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-serif)', fontSize: '15px' }}>{activeSeller.storeName}</h4>
                {getStatusBadge(activeSeller.status)}
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Business Info</h4>
                <div className={styles.infoRow}>
                  <span>Legal entity name:</span>
                  <span className={styles.infoVal}>{activeSeller.businessName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Owner contact:</span>
                  <span className={styles.infoVal}>{activeSeller.ownerName}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Email inbox:</span>
                  <span className={styles.infoVal}>{activeSeller.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Pickup location:</span>
                  <span className={styles.infoVal}><FiMapPin /> {activeSeller.city}, {activeSeller.state}</span>
                </div>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Compliance Tax Details</h4>
                <div className={styles.infoRow}>
                  <span>GSTIN Number:</span>
                  <span className={styles.infoVal} style={{ fontFamily: 'monospace' }}>{activeSeller.gstin || 'None Listed'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>PAN Card Number:</span>
                  <span className={styles.infoVal} style={{ fontFamily: 'monospace' }}>{activeSeller.panNumber}</span>
                </div>
              </div>

              <div>
                <h4 className={styles.sectionTitle}>Audit Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeSeller.documents && activeSeller.documents.length > 0 ? (
                    activeSeller.documents.map((d, i) => (
                      <a key={i} href={d.fileUrl} target="_blank" rel="noreferrer" className={styles.docLink}>
                        <FiFileText /> {d.docType.replace('_', ' ').toUpperCase()} (Audit View)
                      </a>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>No compliance documents verified.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                {activeSeller.status === 'approved' && (
                  <button 
                    className={`${styles.btn} ${styles.btnDanger}`} 
                    style={{ width: '100%' }}
                    onClick={() => openSuspendModal(activeSeller.id)}
                  >
                    <FiAlertOctagon /> Suspend Store
                  </button>
                )}
                {activeSeller.status === 'suspended' && (
                  <button 
                    className={`${styles.btn} ${styles.btnPrimary}`} 
                    style={{ width: '100%' }}
                    onClick={() => handleReactivate(activeSeller.id, activeSeller.storeName)}
                  >
                    <FiCheckSquare /> Reactivate Store
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* Suspension Reason Modal */}
      {showSuspendModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Suspend Vendor Access</h3>
              <button className={styles.iconBtn} onClick={() => setShowSuspendModal(false)}>
                <FiX />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Reason for Suspension (Sent to Seller)</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="e.g. Repeated delayed shipments. Multiple counterfeit saree reports. Compliance audit failed."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  This reason is shown on their login portal explaining why access is suspended.
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowSuspendModal(false)}>
                Cancel
              </button>
              <button className={styles.btnDanger} onClick={handleSuspendSubmit}>
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill-in Products/Orders Modal */}
      {drillModalMode && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '15px', textTransform: 'capitalize' }}>
                {drillModalMode === 'products' ? 'Listed Sarees Portfolio' : 'Fulfillment Ledger items'}
              </h3>
              <button className={styles.iconBtn} onClick={() => setDrillModalMode(null)}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody} style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {drillLoading ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>Querying items ledger...</div>
              ) : drillItems.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-light)' }}>
                  No items found in this section.
                </div>
              ) : drillModalMode === 'products' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {drillItems.map(p => (
                    <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <img src={p.image} alt="" style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{p.name}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>SKU: {p.sku} | Qty: {p.stockCount}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-color)' }}>₹{p.price.toLocaleString('en-IN')}</span>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>{p.approvalStatus}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {drillItems.map(o => (
                    <div key={o.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '13.5px' }}>Order #{o.orderNumber}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>Placed: {new Date(o.createdAt).toLocaleDateString()} | Qty: {o.quantity}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: 'var(--gold-color)' }}>₹{o.subtotal.toLocaleString('en-IN')}</span>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', marginTop: '2px', fontWeight: 600 }}>{o.fulfillmentStatus}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setDrillModalMode(null)}>
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SellerManagement;
