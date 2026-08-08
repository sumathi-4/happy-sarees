import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash, FiPlus, FiBox, FiAlertCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import DataTable from '../components/DataTable';
import styles from '../styles/ProductList.module.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  async function loadProducts() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await sellerApi.getProducts(params);
      if (res.success) {
        setProducts(res.products);
      } else {
        setErrorMsg('Failed to load products roster.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [search, statusFilter]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      try {
        const res = await sellerApi.deleteProduct(id);
        if (res.success) {
          setProducts(products.filter(p => p.id !== id));
        } else {
          alert('Failed to delete product.');
        }
      } catch (err) {
        alert(err.message || 'An error occurred.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Review</span>;
      case 'approved': return <span className={`${styles.badge} ${styles.badgeApproved}`}>Approved</span>;
      case 'rejected': return <span className={`${styles.badge} ${styles.badgeRejected}`}>Rejected</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.managementHeader}>
        <div>
          <h1 className={styles.pageTitle}>Saree Products</h1>
          <p className={styles.pageDesc}>Manage your saree catalog, check verification statuses, and list new products.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/products/new" className={styles.addBtn}>
            <FiPlus /> List New Saree
          </Link>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, SKU..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterSelects}>
            <div className={styles.selectGroup}>
              <label>Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '70px', backgroundColor: 'var(--border-color)', borderRadius: '12px' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.tableCard}>
          <div className={styles.emptyState}>
            <FiBox className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No Products Found</h3>
            <p className={styles.emptyDesc}>
              {search || statusFilter 
                ? 'Try adjusting your filters or search terms.' 
                : 'Start showcasing your beautiful weaves! Click "List New Saree" to submit your first product.'}
            </p>
            {!search && !statusFilter && (
              <Link to="/products/new" className={styles.btnPrimary} style={{ marginTop: '12px' }}>
                List Your First Saree
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <DataTable headers={['Saree', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
            {products.map(p => (
              <tr key={p.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.productCell}>
                    <img src={p.image} alt={p.name} className={styles.productImg} />
                    <div className={styles.productInfo}>
                      <Link to={`/products/${p.id}/edit`} className={styles.productNameLink}>
                        {p.name}
                      </Link>
                      <span className={styles.sku}>SKU: {p.sku}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.td} style={{ fontStyle: 'italic' }}>
                  {p.categoryName || 'Sarees'}
                </td>
                <td className={styles.td} style={{ fontWeight: 700, color: 'var(--gold-color)' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </td>
                <td className={styles.td}>
                  <span style={{ fontWeight: 600, color: p.stockCount === 0 ? 'var(--error-color)' : 'inherit' }}>
                    {p.stockCount} in stock
                  </span>
                </td>
                <td className={styles.td}>
                  {getStatusBadge(p.approvalStatus)}
                  {p.approvalStatus === 'rejected' && (
                    <div className={styles.statusReason}>
                      <strong>Reason:</strong> {p.rejectionReason || 'Attributes mismatch.'}
                      <div style={{ marginTop: '4px' }}>
                        <button 
                          className={styles.link}
                          style={{ background: 'none', border: 'none', padding: 0, fontSize: '11px', cursor: 'pointer' }}
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                        >
                          Edit & Resubmit
                        </button>
                      </div>
                    </div>
                  )}
                </td>
                <td className={styles.td} style={{ textAlign: 'right' }}>
                  <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                    <button 
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => navigate(`/products/${p.id}/edit`)}
                      title="Edit Saree"
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(p.id, p.name)}
                      title="Delete Saree"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}
    </div>
  );
}

export default ProductList;
