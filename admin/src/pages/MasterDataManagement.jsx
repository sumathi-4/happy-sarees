import React, { useState } from 'react';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiCheck, FiX, 
  FiAlertTriangle, FiChevronLeft, FiChevronRight, FiArrowLeft,
  FiGrid, FiLayers, FiCalendar, FiDroplet, FiTag, FiBox, FiSliders,
  FiMaximize2, FiFeather, FiArrowRight
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import styles from '../styles/MasterDataManagement.module.css';

function MasterDataManagement() {
  const { 
    masterData, addMasterItem, updateMasterItem, deleteMasterItem, 
    addMasterType, updateMasterType, deleteMasterType, toggleMasterType 
  } = useAdminData();

  // View mode: 'grid' (overview of all master type cards) or 'table' (single master type detail view matching Image 3)
  const [viewMode, setViewMode] = useState('grid');

  // Selected Master Type key (e.g., 'fabrics', 'occasions')
  const [selectedType, setSelectedType] = useState('fabrics');

  // Search & Pagination inside current type
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add/Edit item Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null if adding
  const [itemName, setItemName] = useState('');
  const [itemStatus, setItemStatus] = useState('Active');
  const [itemSortOrder, setItemSortOrder] = useState('');

  // Add/Edit Master Type Modal States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeShowInFilters, setNewTypeShowInFilters] = useState(true);
  const [newTypeShowInSpecs, setNewTypeShowInSpecs] = useState(true);

  const [editingTypeKey, setEditingTypeKey] = useState(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeShowInFilters, setEditTypeShowInFilters] = useState(true);
  const [editTypeShowInSpecs, setEditTypeShowInSpecs] = useState(true);

  // Delete Confirm Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteTypeConfirmKey, setDeleteTypeConfirmKey] = useState(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Human readable title helper
  const formatTypeLabel = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Category Icon helper
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

  // Get list of master types dynamically
  const masterKeys = Object.keys(masterData);

  // Get active items
  const activeItems = masterData[selectedType] || [];

  // Filter items
  const filteredItems = activeItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort items by sortOrder
  const sortedItems = [...filteredItems].sort((a, b) => a.sortOrder - b.sortOrder);

  // Paginated items
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const paginatedItems = sortedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle Add/Edit item submit
  const handleItemSubmit = (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert("Name is required.");
      return;
    }

    const sortOrderVal = Number(itemSortOrder) || (activeItems.length + 1);

    if (editingItem) {
      // Edit mode
      updateMasterItem(selectedType, editingItem.id, {
        name: itemName.trim(),
        status: itemStatus,
        sortOrder: sortOrderVal
      });
      triggerToast(`Updated "${itemName}" successfully.`);
    } else {
      // Add mode
      addMasterItem(selectedType, {
        name: itemName.trim(),
        status: itemStatus,
        sortOrder: sortOrderVal
      });
      triggerToast(`Added "${itemName}" successfully.`);
    }

    setShowItemModal(false);
    setEditingItem(null);
    setItemName('');
    setItemStatus('Active');
    setItemSortOrder('');
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemStatus(item.status);
    setItemSortOrder(item.sortOrder.toString());
    setShowItemModal(true);
  };

  // Toggle status directly in table row
  const handleToggleStatus = (item) => {
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    updateMasterItem(selectedType, item.id, { status: nextStatus });
    triggerToast(`Status for "${item.name}" changed to ${nextStatus}.`);
  };

  // Execute Delete
  const handleDeleteExecute = () => {
    const targetItem = activeItems.find(x => x.id === deleteConfirmId);
    if (targetItem) {
      deleteMasterItem(selectedType, deleteConfirmId);
      triggerToast(`Removed "${targetItem.name}" from ${formatTypeLabel(selectedType)}.`);
    }
    setDeleteConfirmId(null);
  };

  // Add new Custom Master Category Type
  const handleTypeSubmit = (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      alert("Type name is required.");
      return;
    }
    const cleanKey = newTypeName.toLowerCase().trim().replace(/\s+/g, '_');
    if (masterKeys.includes(cleanKey)) {
      alert("This Master Type already exists.");
      return;
    }
    addMasterType(newTypeName, {
      showInFilters: newTypeShowInFilters,
      showInSpecs: newTypeShowInSpecs,
      show_in_filters: newTypeShowInFilters,
      show_in_specifications: newTypeShowInSpecs
    });
    setSelectedType(cleanKey);
    setViewMode('table');
    setShowTypeModal(false);
    setNewTypeName('');
    setNewTypeShowInFilters(true);
    setNewTypeShowInSpecs(true);
    triggerToast(`Created new category classification "${newTypeName}".`);
  };

  // Handle Master Type Edit Submit
  const handleEditTypeSubmit = async (e) => {
    e.preventDefault();
    if (!editTypeName.trim()) return;
    await updateMasterType(editingTypeKey, { 
      name: editTypeName.trim(),
      showInFilters: editTypeShowInFilters,
      showInSpecs: editTypeShowInSpecs,
      show_in_filters: editTypeShowInFilters,
      show_in_specifications: editTypeShowInSpecs
    });
    triggerToast(`Updated Master Type to "${editTypeName.trim()}".`);
    setEditingTypeKey(null);
  };

  // Handle Master Type Delete Execute
  const handleDeleteTypeExecute = async () => {
    if (deleteTypeConfirmKey) {
      const typeLabel = formatTypeLabel(deleteTypeConfirmKey);
      await deleteMasterType(deleteTypeConfirmKey);
      triggerToast(`Deleted Master Type "${typeLabel}".`);
      setDeleteTypeConfirmKey(null);
      if (selectedType === deleteTypeConfirmKey) {
        setSelectedType(masterKeys.find(k => k !== deleteTypeConfirmKey) || 'fabrics');
      }
    }
  };

  // Handle Master Type Status Toggle
  const handleToggleTypeStatus = async (e, typeKey) => {
    e.stopPropagation();
    await toggleMasterType(typeKey);
    triggerToast(`Toggled status for "${formatTypeLabel(typeKey)}".`);
  };

  return (
    <div className={styles.wrapper}>
      {toastMessage && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMessage}
        </div>
      )}

      {/* Confirmation delete item modal */}
      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FiAlertTriangle className={styles.modalWarnIcon} />
            <h3 className={styles.modalTitle}>Delete Classification Record?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this option? Products classified under this value may lose their filters.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.dangerBtn} onClick={handleDeleteExecute}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Metadata Item Modal */}
      {showItemModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalForm}>
            <div className={styles.modalFormHeader}>
              <h3>{editingItem ? 'Edit Classification Option' : `Add to ${formatTypeLabel(selectedType)}`}</h3>
              <button className={styles.closeBtn} onClick={() => setShowItemModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleItemSubmit}>
              <div className={styles.formGroup}>
                <label>Display Name</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)} 
                  placeholder="e.g. Silk, Banarasi, Lavender" 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select value={itemStatus} onChange={(e) => setItemStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Sort Order Index</label>
                <input 
                  type="number" 
                  value={itemSortOrder} 
                  onChange={(e) => setItemSortOrder(e.target.value)}
                  placeholder="e.g. 1, 2, 3"
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowItemModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>
                  {editingItem ? 'Save Changes' : 'Create Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Master Category Type Modal */}
      {showTypeModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalForm}>
            <div className={styles.modalFormHeader}>
              <h3>Create New Master Category Type</h3>
              <button className={styles.closeBtn} onClick={() => setShowTypeModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleTypeSubmit}>
              <div className={styles.formGroup}>
                <label>Master Type Name</label>
                <input 
                  type="text" 
                  value={newTypeName} 
                  onChange={(e) => setNewTypeName(e.target.value)} 
                  placeholder="e.g. Wash Instructions, Loom Centers" 
                  required
                />
              </div>

              {/* Checkboxes for Website Visibility */}
              <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={newTypeShowInFilters} 
                    onChange={(e) => setNewTypeShowInFilters(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#d11b69' }}
                  />
                  <span>Display in Website Filters (Shop Sidebar)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={newTypeShowInSpecs} 
                    onChange={(e) => setNewTypeShowInSpecs(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#d11b69' }}
                  />
                  <span>Display in Saree Details (Product Specifications)</span>
                </label>
              </div>

              <p style={{ fontSize: '11px', color: '#999999', marginBottom: '14px', lineHeight: '1.4' }}>
                This creates a global schema type. Once defined, you can immediately add dropdown values for selection inside product forms.
              </p>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowTypeModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Create Schema Type</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Master Type Modal */}
      {deleteTypeConfirmKey && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FiAlertTriangle className={styles.modalWarnIcon} />
            <h3 className={styles.modalTitle}>Delete Master Type "{formatTypeLabel(deleteTypeConfirmKey)}"?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this entire Master Type and all its items? Products classified under this type may lose their filter mappings.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTypeConfirmKey(null)}>Cancel</button>
              <button className={styles.dangerBtn} onClick={handleDeleteTypeExecute}>Delete Master Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Master Type Modal */}
      {editingTypeKey && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalForm}>
            <div className={styles.modalFormHeader}>
              <h3>Edit Master Type "{formatTypeLabel(editingTypeKey)}"</h3>
              <button className={styles.closeBtn} onClick={() => setEditingTypeKey(null)}><FiX /></button>
            </div>
            <form onSubmit={handleEditTypeSubmit}>
              <div className={styles.formGroup}>
                <label>Master Type Name</label>
                <input 
                  type="text" 
                  value={editTypeName} 
                  onChange={(e) => setEditTypeName(e.target.value)} 
                  required
                />
              </div>

              {/* Checkboxes for Website Visibility */}
              <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa', padding: '12px 14px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={editTypeShowInFilters} 
                    onChange={(e) => setEditTypeShowInFilters(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#d11b69' }}
                  />
                  <span>Display in Website Filters (Shop Sidebar)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={editTypeShowInSpecs} 
                    onChange={(e) => setEditTypeShowInSpecs(e.target.checked)} 
                    style={{ width: '16px', height: '16px', accentColor: '#d11b69' }}
                  />
                  <span>Display in Saree Details (Product Specifications)</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingTypeKey(null)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: ALL MASTER TYPE CARDS GRID (FULL SECTION PAGE) */}
      {viewMode === 'grid' && (
        <div>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2b2b2b', marginBottom: '4px' }}>Master Data Management</h2>
              <p style={{ fontSize: '13px', color: '#666666' }}>Manage fabrics, colors, occasions, and metadata classification schemes globally</p>
            </div>
            <button className={styles.addBtn} onClick={() => setShowTypeModal(true)}>
              <FiPlus /> Add New Master Type
            </button>
          </div>

          {/* Master Type Cards Grid */}
          <div className={styles.cardsGrid}>
            {masterKeys.map((key) => {
              const count = masterData[key]?.length || 0;
              return (
                <div 
                  key={key} 
                  className={styles.typeCard}
                  onClick={() => { setSelectedType(key); setViewMode('table'); setSearchQuery(''); setCurrentPage(1); }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.iconCircle}>
                      {getCategoryIcon(key)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.cardBadge}>{count} Items</span>
                      <div className={styles.cardActionGroup} onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={styles.cardActionBtn} 
                          onClick={(e) => { e.stopPropagation(); setEditingTypeKey(key); setEditTypeName(formatTypeLabel(key)); }}
                          title="Edit Master Type Name"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className={`${styles.cardActionBtn} ${styles.cardDeleteBtn}`} 
                          onClick={(e) => { e.stopPropagation(); setDeleteTypeConfirmKey(key); }}
                          title="Delete Master Type"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className={styles.cardTitle}>{formatTypeLabel(key)}</h3>
                  <p className={styles.cardDesc}>
                    Manage options and values for {formatTypeLabel(key).toLowerCase()} in saree forms.
                  </p>

                  <div className={styles.cardFooter}>
                    <span className={styles.manageLink}>
                      Manage {formatTypeLabel(key)} <FiArrowRight style={{ marginLeft: '4px' }} />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add New Master Type Card */}
            <div 
              className={styles.addTypeCard}
              onClick={() => setShowTypeModal(true)}
            >
              <div className={styles.addIconCircle}>
                <FiPlus />
              </div>
              <h3 className={styles.addCardTitle}>Add New Master Type</h3>
              <p className={styles.addCardDesc}>Create a custom classification scheme</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: SINGLE MASTER TYPE DETAIL TABLE VIEW (MATCHES IMAGE 3 EXACTLY) */}
      {viewMode === 'table' && (
        <div className={styles.mainGridPanel}>

          {/* Back Navigation Bar & Quick Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className={styles.backBtn} onClick={() => setViewMode('grid')}>
              <FiArrowLeft style={{ marginRight: '6px' }} /> Back to All Master Types
            </button>

            {/* Quick Type Switcher Pills */}
            <div className={styles.quickTypePills}>
              {masterKeys.map((key) => (
                <button
                  key={key}
                  className={`${styles.pillBtn} ${selectedType === key ? styles.pillBtnActive : ''}`}
                  onClick={() => { setSelectedType(key); setSearchQuery(''); setCurrentPage(1); }}
                >
                  {formatTypeLabel(key)} ({masterData[key]?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {/* Panel Header */}
          <div className={styles.panelHeader}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2b2b2b' }}>{formatTypeLabel(selectedType)}</h3>
              <p style={{ fontSize: '13px', color: '#666666', marginTop: '2px' }}>Manage options and values for your sarees</p>
            </div>
            <button className={styles.addBtn} onClick={() => { setEditingItem(null); setItemName(''); setItemStatus('Active'); setItemSortOrder(''); setShowItemModal(true); }}>
              + Add {formatTypeLabel(selectedType).replace(/s$/, '') || 'Option'}
            </button>
          </div>

          {/* Search bar inside the grid */}
          <div className={styles.gridSearchBar}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={`Search ${formatTypeLabel(selectedType)}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Grid list elements */}
          {paginatedItems.length > 0 ? (
            <div>
              <DataTable headers={['NAME', 'STATUS', 'SORT ORDER', 'ACTIONS']}>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: '#2b2b2b' }}>{item.name}</td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(item)}
                        className={item.status === 'Active' ? styles.statusActive : styles.statusInactive}
                        title="Click to toggle status"
                      >
                        {item.status}
                      </button>
                    </td>
                    <td>
                      <span className={styles.sortIndicator}>{item.sortOrder}</span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={styles.actionBtn} onClick={() => openEditModal(item)} title="Edit Option">
                          <FiEdit />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.deleteActionBtn}`} onClick={() => setDeleteConfirmId(item.id)} title="Delete Option">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>

              {/* Pagination controls */}
              <div className={styles.paginationRow}>
                <span style={{ fontSize: '12.5px', color: '#666666' }}>
                  Showing {Math.min(sortedItems.length, (currentPage - 1) * itemsPerPage + 1)}-
                  {Math.min(sortedItems.length, currentPage * itemsPerPage)} of {sortedItems.length} records
                </span>
                <div className={styles.paginationControls}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                    disabled={currentPage === 1}
                    className={styles.pageArrowBtn}
                  >
                    <FiChevronLeft />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={currentPage === idx + 1 ? styles.pageNumberBtnActive : styles.pageNumberBtn}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className={styles.pageArrowBtn}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title={`No ${formatTypeLabel(selectedType)} Options Found`}
              description={`We couldn't find any metadata option for "${selectedType}" matching your search keywords.`}
            />
          )}
        </div>
      )}

    </div>
  );
}

export default MasterDataManagement;
