import React, { useState } from 'react';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiCheck, FiX, 
  FiAlertTriangle, FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import EmptyState from '../components/EmptyState';
import DataTable from '../components/DataTable';
import styles from '../styles/MasterDataManagement.module.css';

function MasterDataManagement() {
  const { 
    masterData, addMasterItem, updateMasterItem, deleteMasterItem, addMasterType 
  } = useAdminData();

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

  // Add Master Type Modal States
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // Delete Confirm Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
    addMasterType(newTypeName);
    setSelectedType(cleanKey);
    setShowTypeModal(false);
    setNewTypeName('');
    triggerToast(`Created new category classification "${newTypeName}".`);
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

      {/* Top Description row */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#2b2b2b', marginBottom: '4px' }}>Master Data Management</h2>
        <p style={{ fontSize: '13px', color: '#666666' }}>Manage fabrics, colors, occasions, and metadata classification schemes globally</p>
      </div>

      {/* Split view panel layout */}
      <div className={styles.splitLayout}>
        
        {/* Left Column Sidebar: List of Types */}
        <div className={styles.sidebarPanel}>
          <h3 className={styles.panelTitle}>Select Master Type</h3>
          <ul className={styles.typeList}>
            {masterKeys.map((key) => {
              const count = masterData[key]?.length || 0;
              const isActive = selectedType === key;
              return (
                <li key={key}>
                  <button 
                    className={`${styles.typeBtn} ${isActive ? styles.typeBtnActive : ''}`}
                    onClick={() => { setSelectedType(key); setSearchQuery(''); setCurrentPage(1); }}
                  >
                    <span>{formatTypeLabel(key)}</span>
                    <span className={styles.countBadge}>{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button className={styles.addTypeBtn} onClick={() => setShowTypeModal(true)}>
            <FiPlus /> Add New Master Type
          </button>
        </div>

        {/* Right Column: Active CRUD Table */}
        <div className={styles.mainGridPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#2b2b2b' }}>{formatTypeLabel(selectedType)}</h3>
              <p style={{ fontSize: '12px', color: '#999999' }}>Manage options and values for your sarees</p>
            </div>
            <button className={styles.addBtn} onClick={() => { setEditingItem(null); setItemName(''); setItemStatus('Active'); setItemSortOrder(''); setShowItemModal(true); }}>
              <FiPlus /> Add {formatTypeLabel(selectedType).slice(0, -1) || 'Option'}
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
              <DataTable headers={['Name', 'Status', 'Sort Order', 'Actions']}>
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

      </div>
    </div>
  );
}

export default MasterDataManagement;
