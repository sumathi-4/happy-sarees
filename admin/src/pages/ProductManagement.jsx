import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiSliders, FiEye, FiEdit2, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiGrid, FiList, FiRefreshCw, 
  FiDownload, FiAlertTriangle, FiCheck, FiMoreHorizontal, FiCopy
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import styles from '../styles/ProductManagement.module.css';

function ProductManagement() {
  const navigate = useNavigate();
  const { products, setProducts, deleteProduct, duplicateProduct, masterData } = useAdminData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');
  const [priceRange, setPriceRange] = useState('All');

  // Table Selection State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Dialog States
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to show temporary toasts
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    // Search filter
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    // Fabric filter
    const matchesFabric = selectedFabric === 'All' || p.fabric === selectedFabric;

    // Occasion filter
    const matchesOccasion = selectedOccasion === 'All' || p.occasion === selectedOccasion;

    // Status filter
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    // Stock Status filter
    let matchesStock = true;
    if (selectedStock === 'In Stock') matchesStock = p.stock > 5;
    else if (selectedStock === 'Low Stock') matchesStock = p.stock > 0 && p.stock <= 5;
    else if (selectedStock === 'Out of Stock') matchesStock = p.stock === 0;

    // Tag filter
    let matchesTag = true;
    if (selectedTag === 'New Arrival') matchesTag = p.newArrival;
    else if (selectedTag === 'Best Seller') matchesTag = p.bestSeller;
    else if (selectedTag === 'Featured Collection') matchesTag = p.featuredCollection;
    else if (selectedTag === 'Sale Product') matchesTag = p.saleProduct;

    // Price Range filter
    let matchesPrice = true;
    if (priceRange === 'under-3k') matchesPrice = p.price < 3000;
    else if (priceRange === '3k-6k') matchesPrice = p.price >= 3000 && p.price <= 6000;
    else if (priceRange === 'over-6k') matchesPrice = p.price > 6000;

    return matchesSearch && matchesFabric && matchesOccasion && matchesStatus && matchesStock && matchesTag && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Recent') {
      return b.id - a.id;
    }
    if (sortBy === 'PriceLowHigh') {
      return a.price - b.price;
    }
    if (sortBy === 'PriceHighLow') {
      return b.price - a.price;
    }
    if (sortBy === 'StockLowHigh') {
      return a.stock - b.stock;
    }
    if (sortBy === 'Name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Pagination (Mocked: 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Multi-select actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(x => x !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  // Bulk operation triggers
  const handleBulkAction = (action) => {
    if (selectedProductIds.length === 0) {
      alert('Please select at least one product first.');
      return;
    }

    if (action === 'delete') {
      setBulkDeleteConfirm(true);
      setShowBulkActions(false);
      return;
    }

    let updatedProducts = [...products];

    if (action === 'activate') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, status: 'Published' } : p
      );
      triggerToast(`Activated ${selectedProductIds.length} products successfully.`);
    } else if (action === 'deactivate') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, status: 'Draft' } : p
      );
      triggerToast(`Deactivated ${selectedProductIds.length} products successfully.`);
    } else if (action === 'mark-new') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, newArrival: true } : p
      );
      triggerToast(`Marked ${selectedProductIds.length} products as New Arrival.`);
    } else if (action === 'mark-best') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, bestSeller: true } : p
      );
      triggerToast(`Marked ${selectedProductIds.length} products as Bestseller.`);
    } else if (action === 'mark-featured') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, featuredCollection: true } : p
      );
      triggerToast(`Marked ${selectedProductIds.length} products as Featured.`);
    } else if (action === 'mark-sale') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, saleProduct: true } : p
      );
      triggerToast(`Marked ${selectedProductIds.length} products as Sale.`);
    } else if (action === 'draft') {
      updatedProducts = products.map(p => 
        selectedProductIds.includes(p.id) ? { ...p, status: 'Draft' } : p
      );
      triggerToast(`Moved ${selectedProductIds.length} products to Draft.`);
    } else if (action === 'duplicate') {
      selectedProductIds.forEach(id => duplicateProduct(id));
      triggerToast(`Duplicated ${selectedProductIds.length} products.`);
    } else if (action === 'export') {
      const selectedData = products.filter(p => selectedProductIds.includes(p.id));
      const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `happy_sarees_products_export_${Date.now()}.json`;
      link.click();
      triggerToast(`Exported ${selectedProductIds.length} products successfully.`);
    }

    setProducts(updatedProducts);
    setSelectedProductIds([]);
    setShowBulkActions(false);
  };

  // Delete handlers
  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteExecute = () => {
    deleteProduct(deleteConfirmId);
    setDeleteConfirmId(null);
    triggerToast('Product deleted successfully.');
  };

  const handleBulkDeleteExecute = () => {
    setProducts(products.filter(p => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    setBulkDeleteConfirm(false);
    triggerToast('Selected products deleted successfully.');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFabric('All');
    setSelectedOccasion('All');
    setSelectedStatus('All');
    setSelectedStock('All');
    setSelectedTag('All');
    setSortBy('Recent');
    setPriceRange('All');
    setCurrentPage(1);
    triggerToast('Filters reset.');
  };

  return (
    <div className={styles.wrapper}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMessage}
        </div>
      )}

      {/* Confirmation Modals */}
      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FiAlertTriangle className={styles.modalWarnIcon} />
            <h3 className={styles.modalTitle}>Delete Product?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this saree? This action is permanent and cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.dangerBtn} onClick={handleDeleteExecute}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <FiAlertTriangle className={styles.modalWarnIcon} />
            <h3 className={styles.modalTitle}>Delete Selected Products?</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete the {selectedProductIds.length} selected sarees? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setBulkDeleteConfirm(false)}>Cancel</button>
              <button className={styles.dangerBtn} onClick={handleBulkDeleteExecute}>Delete Selected</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info Banner */}
      <div className={styles.managementHeader}>
        <div className={styles.headerTitles}>
          <h2 className={styles.pageTitle}>Product Management</h2>
          <p className={styles.pageDesc}>Manage and organize your store products</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.exportBtn}
            onClick={() => {
              const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `happy_sarees_all_products_${Date.now()}.json`;
              link.click();
              triggerToast('Exported entire catalog.');
            }}
          >
            <FiDownload /> Export
          </button>
          <button className={styles.addBtn} onClick={() => navigate('/products/add')}>
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Search & Filter Bar Card */}
      <div className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSelects}>
            <div className={styles.selectGroup}>
              <label>Fabric</label>
              <select value={selectedFabric} onChange={(e) => { setSelectedFabric(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Fabrics</option>
                {masterData.fabrics?.map(f => (
                  <option key={f.id} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Occasion</label>
              <select value={selectedOccasion} onChange={(e) => { setSelectedOccasion(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Occasions</option>
                {masterData.occasions?.map(o => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Status</label>
              <select value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Price</label>
              <select value={priceRange} onChange={(e) => { setPriceRange(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Prices</option>
                <option value="under-3k">Under ₹3,000</option>
                <option value="3k-6k">₹3,000 - ₹6,000</option>
                <option value="over-6k">Over ₹6,000</option>
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Recent">Recent</option>
                <option value="Name">Name (A-Z)</option>
                <option value="PriceLowHigh">Price: Low to High</option>
                <option value="PriceHighLow">Price: High to Low</option>
                <option value="StockLowHigh">Stock: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Extended Filter Toggles Row */}
        <div className={styles.extendedFilterRow}>
          <div className={styles.filterSelects}>
            <div className={styles.selectGroup}>
              <label>Stock Status</label>
              <select value={selectedStock} onChange={(e) => { setSelectedStock(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Stock</option>
                <option value="In Stock">In Stock (&gt;5)</option>
                <option value="Low Stock">Low Stock (1-5)</option>
                <option value="Out of Stock">Out of Stock (0)</option>
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label>Homepage Tags</label>
              <select value={selectedTag} onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}>
                <option value="All">All Tags</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Best Seller">Bestseller</option>
                <option value="Featured Collection">Featured</option>
                <option value="Sale Product">Sale</option>
              </select>
            </div>
          </div>

          <button className={styles.resetBtn} onClick={handleResetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Selected Action Panel */}
      <div className={styles.actionPanel}>
        <div className={styles.selectedIndicator}>
          <input
            type="checkbox"
            checked={paginatedProducts.length > 0 && selectedProductIds.length === paginatedProducts.length}
            onChange={handleSelectAll}
            className={styles.checkbox}
          />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#666666' }}>
            {selectedProductIds.length} selected
          </span>
          <div style={{ position: 'relative' }}>
            <button 
              className={styles.bulkActionTrigger}
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Bulk Actions <FiMoreHorizontal />
            </button>

            {showBulkActions && (
              <div className={styles.bulkDropdown}>
                <button onClick={() => handleBulkAction('activate')}><FiCheck /> Activate Selected</button>
                <button onClick={() => handleBulkAction('deactivate')}><FiAlertTriangle /> Deactivate Selected</button>
                <button onClick={() => handleBulkAction('mark-new')}>★ Mark as New Arrival</button>
                <button onClick={() => handleBulkAction('mark-best')}>★ Mark as Bestseller</button>
                <button onClick={() => handleBulkAction('mark-featured')}>★ Mark as Featured</button>
                <button onClick={() => handleBulkAction('mark-sale')}>★ Mark as Sale Product</button>
                <button onClick={() => handleBulkAction('draft')}>Move to Draft</button>
                <button onClick={() => handleBulkAction('duplicate')}><FiCopy /> Duplicate Product</button>
                <button onClick={() => handleBulkAction('export')}><FiDownload /> Export Selected</button>
                <button onClick={() => handleBulkAction('delete')} style={{ color: '#d32f2f' }}><FiTrash2 /> Delete Selected</button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.layoutToggles}>
          <button className={styles.refreshBtn} onClick={() => { handleResetFilters(); triggerToast('Data refreshed.'); }} title="Refresh List">
            <FiRefreshCw />
          </button>
          <button className={styles.layoutBtnActive}><FiList /></button>
          <button className={styles.layoutBtn} onClick={() => alert('Grid view layout coming soon.')}><FiGrid /></button>
        </div>
      </div>

      {/* Main Table Content */}
      {paginatedProducts.length > 0 ? (
        <div className={styles.tableCard}>
          <DataTable headers={['☑', 'Img', 'Product Name', 'SKU', 'Fabric', 'Occasion', 'Price', 'Stock', 'Status', 'Homepage Tags', 'Actions']}>
            {paginatedProducts.map((p) => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <tr key={p.id} className={isSelected ? styles.rowSelected : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(p.id)}
                      className={styles.checkbox}
                    />
                  </td>
                  <td>
                    <img src={p.image} alt={p.name} className={styles.productThumb} />
                  </td>
                  <td style={{ fontWeight: 600, color: '#2b2b2b', maxWidth: '200px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.productNameLink} onClick={() => navigate(`/products/edit/${p.id}`)}>
                        {p.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#999999' }}>Created: {p.createdAt}</span>
                    </div>
                  </td>
                  <td><code style={{ fontSize: '12px', fontWeight: 'bold' }}>{p.sku}</code></td>
                  <td>{p.fabric}</td>
                  <td>{p.occasion}</td>
                  <td style={{ fontWeight: 600, color: '#d11b69' }}>₹{p.price}</td>
                  <td>
                    {p.stock === 0 ? (
                      <span className={styles.outOfStockBadge}>Out of Stock</span>
                    ) : p.stock <= 5 ? (
                      <span className={styles.lowStockBadge}>Low Stock ({p.stock})</span>
                    ) : (
                      <span className={styles.stockQuantity}>{p.stock}</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td>
                    <div className={styles.tagsContainer}>
                      {p.newArrival && <span className={`${styles.tagPill} ${styles.tagNew}`}>New Arrival</span>}
                      {p.bestSeller && <span className={`${styles.tagPill} ${styles.tagBest}`}>Bestseller</span>}
                      {p.featuredCollection && <span className={`${styles.tagPill} ${styles.tagFeatured}`}>Featured</span>}
                      {p.saleProduct && <span className={`${styles.tagPill} ${styles.tagSale}`}>Sale</span>}
                      {!p.newArrival && !p.bestSeller && !p.featuredCollection && !p.saleProduct && (
                        <span style={{ color: '#999999' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => navigate(`/products/preview/${p.id}`)}
                        title="Preview Saree storefront details"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => navigate(`/products/edit/${p.id}`)}
                        title="Edit Saree details"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteActionBtn}`} 
                        onClick={() => confirmDelete(p.id)}
                        title="Delete Product"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>

          {/* Pagination Row */}
          <div className={styles.paginationRow}>
            <span style={{ fontSize: '13px', color: '#666666' }}>
              Showing {Math.min(sortedProducts.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(sortedProducts.length, currentPage * itemsPerPage)} of {sortedProducts.length} Products
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
          title="No Products Found"
          description="We couldn't find any saree matching your current search parameters and filter settings. Try adjusting your fields or reset filters."
        />
      )}
    </div>
  );
}

export default ProductManagement;
