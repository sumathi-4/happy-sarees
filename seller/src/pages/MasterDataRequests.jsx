import React, { useEffect, useState } from 'react';
import { sellerApi } from '../api/sellerApi';
import { useSellerAuth } from '../context/SellerAuthContext';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiXCircle, 
  FiAlertCircle, FiRefreshCw, FiArrowLeft, FiGrid, FiLayers, FiCalendar, 
  FiDroplet, FiTag, FiBox, FiSliders, FiFeather, FiMaximize2, FiDatabase
} from 'react-icons/fi';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import styles from '../styles/MasterDataRequests.module.css';

const STATUS_BADGE = {
  pending:  { color: '#f59e0b', bg: '#fef3c7', label: 'Pending Review' },
  approved: { color: '#10b981', bg: '#d1fae5', label: 'Approved' },
  rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const cls = status === 'approved' ? styles.statusApproved
             : status === 'rejected' ? styles.statusRejected
             : styles.statusPending;
  return (
    <span className={`${styles.statusBadge} ${cls}`}>
      {status === 'approved' ? <FiCheckCircle size={12} /> :
       status === 'rejected' ? <FiXCircle size={12} /> :
       <FiClock size={12} />}
      {STATUS_BADGE[status]?.label || status}
    </span>
  );
}

function MasterDataRequests() {
  const { sellerUser } = useSellerAuth();
  const currentSellerId = sellerUser?.id ?? null;

  const [activeTab, setActiveTab] = useState('browser'); // 'browser' or 'my-requests'
  const [requests, setRequests] = useState([]);
  const [masterTypes, setMasterTypes] = useState([]);
  const [masterItems, setMasterItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Browser States
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Request Submission Modals
  const [modalType, setModalType] = useState(null); // 'add_type', 'edit_type', 'delete_type', 'add_item', 'edit_item', 'delete_item'
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [typeName, setTypeName] = useState('');
  const [showInFilters, setShowInFilters] = useState(true);
  const [showInSpecifications, setShowInSpecifications] = useState(true);

  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemColorHex, setItemColorHex] = useState('#ffffff');

  const [requestReason, setRequestReason] = useState('');
  const [targetId, setTargetId] = useState(null); // type ID or item ID

  // Load types, items and request logs
  async function loadData(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const [typesRes, itemsRes, reqsRes] = await Promise.all([
        sellerApi.getMasterTypes(),
        sellerApi.getMasterItems(),
        sellerApi.getMasterDataRequests()
      ]);
      if (typesRes.success) setMasterTypes(typesRes.types);
      if (itemsRes.success) setMasterItems(itemsRes.items);
      if (reqsRes.success) setRequests(reqsRes.requests);
    } catch (err) {
      setError(err.message || 'Failed to load master data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const getCategoryIcon = (key) => {
    switch (key.toLowerCase()) {
      case 'fabrics': return <FiLayers />;
      case 'occasions': return <FiCalendar />;
      case 'colors': return <FiDroplet />;
      case 'patterns': return <FiGrid />;
      case 'weaves': return <FiFeather />;
      case 'borders': return <FiMaximize2 />;
      case 'brands': return <FiTag />;
      case 'collections': return <FiBox />;
      default: return <FiSliders />;
    }
  };

  const closeModals = () => {
    setModalType(null);
    setTypeName('');
    setShowInFilters(true);
    setShowInSpecifications(true);
    setItemName('');
    setItemDescription('');
    setItemColorHex('#ffffff');
    setRequestReason('');
    setTargetId(null);
    setError('');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      setError('Please provide a reason / context for this request.');
      return;
    }

    setSubmitting(true);
    setError('');
    
    let payload = {};
    let requestData = {
      requestType: modalType,
      reason: requestReason
    };

    if (modalType === 'add_type') {
      requestData.typeName = typeName;
      payload = { showInFilters, showInSpecifications };
    } 
    else if (modalType === 'edit_type') {
      requestData.targetTypeId = targetId;
      requestData.typeName = typeName;
      payload = { name: typeName, showInFilters, showInSpecifications };
    } 
    else if (modalType === 'delete_type') {
      requestData.targetTypeId = targetId;
      const matched = masterTypes.find(t => t.id === targetId);
      requestData.typeName = matched?.name || '';
    } 
    else if (modalType === 'add_item') {
      const parentType = masterTypes.find(t => t.id === targetId);
      requestData.targetTypeId = targetId;
      requestData.typeSlug = parentType?.slug || '';
      requestData.typeName = parentType?.name || '';
      requestData.itemName = itemName;
      payload = {
        description: itemDescription,
        colorHex: parentType?.slug === 'colors' ? itemColorHex : null,
        isActive: true
      };
    } 
    else if (modalType === 'edit_item') {
      requestData.targetItemId = targetId;
      requestData.targetTypeId = selectedType;
      const parentType = masterTypes.find(t => t.id === selectedType);
      requestData.typeSlug = parentType?.slug || '';
      requestData.typeName = parentType?.name || '';
      requestData.itemName = itemName;
      payload = {
        name: itemName,
        description: itemDescription,
        colorHex: parentType?.slug === 'colors' ? itemColorHex : null,
        isActive: true
      };
    } 
    else if (modalType === 'delete_item') {
      requestData.targetItemId = targetId;
      requestData.targetTypeId = selectedType;
      const matchedItem = masterItems.find(i => i.id === targetId);
      requestData.itemName = matchedItem?.name || '';
    }

    requestData.payload = payload;

    try {
      await sellerApi.submitMasterDataRequest(requestData);
      triggerToast('Change request submitted successfully for administrator review!');
      closeModals();
      loadData();
      setActiveTab('my-requests');
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Browser Detail calculations
  const currentTypeId = selectedType || masterTypes[0]?.id;
  const currentType = masterTypes.find(t => t.id === currentTypeId);
  const activeItems = masterItems.filter(item => item.typeId === currentTypeId);

  const filteredItems = activeItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedItems = [...filteredItems].sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
  
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.wrapper}>
      
      {/* Upper header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            Catalog Specifications &amp; Master Data
          </h1>
          <p className={styles.pageDesc}>
            Browse the active catalog specification attributes and suggest updates to build catalog parity.
          </p>
        </div>
        <button
          onClick={loadData}
          className={styles.refreshBtn}
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Toggle Tab Bar */}
      <div className={styles.tabBar}>
        <button
          onClick={() => { setActiveTab('browser'); setError(''); }}
          className={`${styles.tabBtn} ${activeTab === 'browser' ? styles.tabBtnActive : ''}`}
        >
          Catalog Browser
        </button>
        <button
          onClick={() => { setActiveTab('my-requests'); setError(''); }}
          className={`${styles.tabBtn} ${activeTab === 'my-requests' ? styles.tabBtnActive : ''}`}
        >
          My Change Requests ({requests.length})
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle /> {error}
        </div>
      )}
      {success && (
        <div className={styles.errorAlert} style={{ background: 'var(--success-bg)', color: 'var(--success-color)' }}>
          <FiCheckCircle /> {success}
        </div>
      )}

      {loading ? (
        <div className={styles.emptyState}>Loading Master Data...</div>
      ) : activeTab === 'browser' ? (
        <>
          {viewMode === 'grid' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Attribute Types</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    title="Refresh to see newly approved items"
                    style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', opacity: refreshing ? 0.6 : 1 }}
                  >
                    <FiRefreshCw style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => { setModalType('add_type'); }}
                    style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                  >
                    <FiPlus /> Request New Type
                  </button>
                </div>
              </div>

              <div className={styles.typeGrid}>
                {masterTypes.map(t => {
                  const itemsCount = masterItems.filter(item => item.typeId === t.id).length;
                  return (
                    <div key={t.id} className={styles.typeCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper}>
                          {getCategoryIcon(t.slug)}
                        </div>
                        <div className={styles.titleArea}>
                          <h4 className={styles.cardName}>{t.name}</h4>
                          <span className={styles.countBadge}>{itemsCount} items</span>
                        </div>
                      </div>
                      <p className={styles.cardDesc}>
                        {t.description || `Manage classification options for the ${t.name.toLowerCase()} attribute.`}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#757575', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                          {t.showInFilters ? 'Filters Visible' : 'Filters Hidden'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#757575', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px' }}>
                          {t.showInSpecifications ? 'Specs Visible' : 'Specs Hidden'}
                        </span>
                      </div>

                      <div className={styles.cardActions} style={{ display: 'flex', gap: '8px', marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                        <button
                          onClick={() => {
                            setSelectedType(t.id);
                            setViewMode('table');
                            setCurrentPage(1);
                            setSearchQuery('');
                          }}
                          className={styles.viewItemsBtn}
                          style={{ flex: 1, padding: '7px 12px', borderRadius: '6px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
                        >
                          Browse Items
                        </button>

                        {t.source === 'seller' && t.createdBySellerId === currentSellerId ? (
                          <>
                            <button
                              onClick={() => {
                                setTargetId(t.id);
                                setTypeName(t.name);
                                setShowInFilters(t.showInFilters);
                                setShowInSpecifications(t.showInSpecifications);
                                setModalType('edit_type');
                              }}
                              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #e0e0e0', background: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                              title="Request Edit Type"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => {
                                setTargetId(t.id);
                                setModalType('delete_type');
                              }}
                              style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #fee2e2', color: '#ef4444', background: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                              title="Request Delete Type"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        ) : (
                          <span
                            title="This attribute type is managed by Happy Sarees and cannot be edited by sellers."
                            style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', cursor: 'default' }}
                          >
                            <FiDatabase size={10} />
                            Managed by Happy Sarees
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              {/* Table detail view */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid var(--border-color)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-color)' }}
                >
                  <FiArrowLeft /> Back to Types
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px', color: 'var(--primary-color)' }}>{getCategoryIcon(currentType?.slug || '')}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{currentType?.name || 'Items'}</h3>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '13px', width: '200px' }}
                    />
                  </div>
                  <button
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    title="Refresh to see newly approved items"
                    style={{ background: 'none', border: '1.5px solid var(--border-color)', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-color)', opacity: refreshing ? 0.6 : 1 }}
                  >
                    <FiRefreshCw style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => { setTargetId(currentTypeId); setModalType('add_item'); }}
                    style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                  >
                    <FiPlus /> Request Add Item
                  </button>
                </div>
              </div>

              <DataTable
                headers={['Name', 'Slug', 'Description', 'Status', 'Sort Order', 'Actions']}
                items={paginatedItems}
                renderRow={(item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        {currentType?.slug === 'colors' && item.colorHex && (
                          <span style={{ display: 'block', width: '16px', height: '16px', borderRadius: '50%', background: item.colorHex, border: '1px solid #ccc' }} />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>{item.slug}</td>
                    <td style={{ color: '#6b7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description || '—'}
                    </td>
                    <td>
                      <span style={{ background: item.isActive ? '#d1fae5' : '#fee2e2', color: item.isActive ? '#10b981' : '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{item.sortOrder ?? '—'}</td>
                    <td>
                      {item.source === 'seller' && item.createdBySellerId === currentSellerId ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => {
                              setTargetId(item.id);
                              setItemName(item.name);
                              setItemDescription(item.description || '');
                              setItemColorHex(item.colorHex || '#ffffff');
                              setModalType('edit_item');
                            }}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #e0e0e0', background: 'none', cursor: 'pointer', color: 'var(--text-color)' }}
                            title="Request Edit Item"
                          >
                            <FiEdit size={12} />
                          </button>
                          <button
                            onClick={() => {
                              setTargetId(item.id);
                              setModalType('delete_item');
                            }}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #fee2e2', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                            title="Request Delete Item"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <span
                          title="This item is managed by Happy Sarees and cannot be edited by sellers."
                          style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', cursor: 'default' }}
                        >
                          <FiDatabase size={10} />
                          Managed by Happy Sarees
                        </span>
                      )}
                    </td>
                  </tr>
                )}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ background: 'none', border: '1px solid #e0e0e0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: '13px', color: '#6b7280' }}>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ background: 'none', border: '1px solid #e0e0e0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div>
          {/* My requests list */}
          {requests.length === 0 ? (
            <EmptyState
              title="No Requests Submitted"
              description="Suggest attributes or items to be added/modified in the master catalog. Use the Catalog Browser to start."
              icon={<FiDatabase size={36} />}
            />
          ) : (
            <DataTable
              headers={['Request Type', 'Proposed Change', 'Reason', 'Status', 'Admin Response', 'Submitted On']}
              items={requests}
              renderRow={(r) => {
                const formatReq = (t) => t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                
                const renderProposedDetails = (req) => {
                  const type = req.requestType;
                  if (type === 'add_item') {
                    return (
                      <div>
                        <strong>{req.itemName}</strong>
                        <div style={{ fontSize: '11px', color: '#757575' }}>Under type: {req.typeName || req.typeSlug}</div>
                      </div>
                    );
                  }
                  if (type === 'add_type') {
                    return <div><strong>New Type: {req.typeName}</strong></div>;
                  }
                  if (type === 'edit_item') {
                    return (
                      <div>
                        <strong>Edit Item ID {req.targetItemId}</strong>
                        <div style={{ fontSize: '11px', color: '#757575' }}>New name: {req.payload?.name || req.itemName}</div>
                      </div>
                    );
                  }
                  if (type === 'delete_item') {
                    return <div style={{ color: '#ef4444' }}><strong>Delete Item ID {req.targetItemId}</strong></div>;
                  }
                  if (type === 'edit_type') {
                    return (
                      <div>
                        <strong>Edit Type ID {req.targetTypeId}</strong>
                        <div style={{ fontSize: '11px', color: '#757575' }}>New name: {req.payload?.name || req.typeName}</div>
                      </div>
                    );
                  }
                  if (type === 'delete_type') {
                    return <div style={{ color: '#ef4444' }}><strong>Delete Type ID {req.targetTypeId}</strong></div>;
                  }
                  return <div>{req.itemName || req.typeName}</div>;
                };

                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{formatReq(r.requestType || 'add_item')}</td>
                    <td>{renderProposedDetails(r)}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.reason}>
                      {r.reason || '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: '#ef4444', fontWeight: 500 }}>{r.adminNote || '—'}</td>
                    <td style={{ fontSize: '12px', color: '#757575' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              }}
            />
          )}
        </div>
      )}

      {/* Submission Modal Overlay */}
      {modalType && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={closeModals} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: '16px', padding: '32px', zIndex: 201, width: '480px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '18px', color: 'var(--text-color, #2b1220)' }}>
              Submit Request: {modalType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </h3>
            
            <form onSubmit={handleRequestSubmit}>
              
              {/* Conditional Inputs */}
              {(modalType === 'add_type' || modalType === 'edit_type') && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Type Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zari Types, Silk Purity"
                    value={typeName}
                    onChange={e => setTypeName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={showInFilters} onChange={e => setShowInFilters(e.target.checked)} />
                      Show in website filters
                    </label>
                    <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={showInSpecifications} onChange={e => setShowInSpecifications(e.target.checked)} />
                      Show in specifications
                    </label>
                  </div>
                </div>
              )}

              {(modalType === 'add_item' || modalType === 'edit_item') && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Georgette, Royal Blue"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', boxSizing: 'border-box', marginBottom: '12px' }}
                  />

                  {((modalType === 'add_item' && masterTypes.find(t => t.id === targetId)?.slug === 'colors') ||
                    (modalType === 'edit_item' && currentType?.slug === 'colors')) && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Color Hex Code *</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={itemColorHex}
                          onChange={e => setItemColorHex(e.target.value)}
                          style={{ border: '1px solid #ccc', borderRadius: '4px', width: '40px', height: '40px', padding: '0', cursor: 'pointer' }}
                        />
                        <input
                          type="text"
                          value={itemColorHex}
                          onChange={e => setItemColorHex(e.target.value)}
                          placeholder="#ffffff"
                          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', width: '120px' }}
                        />
                      </div>
                    </div>
                  )}

                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of this item..."
                    value={itemDescription}
                    onChange={e => setItemDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              )}

              {/* Reason Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                  Reason / Business Context *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell administration why this catalog change is required (e.g. 'Needed for listing new Kanchipuram collection')..."
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e0e0e0', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={closeModals}
                  style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
}

export default MasterDataRequests;
