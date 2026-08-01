import React, { useState, useMemo } from 'react';
import { 
  FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, 
  FiChevronUp, FiChevronDown, FiX, FiCheck, FiClock, FiAlertCircle 
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/AnnouncementManager.module.css';

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'anc_1',
    text: 'Free Shipping Above ₹999',
    icon: '🚚',
    link: '/shop',
    linkTarget: '_self',
    duration: 5,
    startDate: '',
    endDate: '',
    bgColor: 'var(--text-color)',
    textColor: 'var(--bg-white)',
    iconColor: '#ffeb3b',
    status: 'active',
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'anc_2',
    text: 'Flat 20% OFF On Silk Sarees',
    icon: '🎁',
    link: '/shop',
    linkTarget: '_self',
    duration: 5,
    startDate: '',
    endDate: '',
    bgColor: 'var(--primary-color)',
    textColor: 'var(--bg-white)',
    iconColor: 'var(--bg-white)',
    status: 'active',
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'anc_3',
    text: 'Premium Bridal Collection Available',
    icon: '💎',
    link: '/collections/bridal',
    linkTarget: '_self',
    duration: 6,
    startDate: '',
    endDate: '',
    bgColor: 'var(--text-color)',
    textColor: 'var(--bg-white)',
    iconColor: 'var(--gold-color)',
    status: 'active',
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'anc_4',
    text: 'End Of Season Sale Live Now',
    icon: '🔥',
    link: '/sale',
    linkTarget: '_self',
    duration: 4,
    startDate: '',
    endDate: '',
    bgColor: '#b71c1c',
    textColor: 'var(--bg-white)',
    iconColor: '#ffeb3b',
    status: 'active',
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'anc_5',
    text: 'New Arrivals Updated Every Week',
    icon: '⭐',
    link: '/new-arrivals',
    linkTarget: '_self',
    duration: 5,
    startDate: '',
    endDate: '',
    bgColor: '#4a148c',
    textColor: 'var(--bg-white)',
    iconColor: '#ffeb3b',
    status: 'draft',
    sortOrder: 5,
    createdAt: new Date().toISOString()
  }
];

const AVAILABLE_ICONS = ['🚚', '🎁', '💎', '🔥', '⭐', '🛡️', 'ℹ️', '✨', '📢', '👑', '🌸', '💫'];
const PRESET_BG_COLORS = ['var(--text-color)', 'var(--primary-color)', '#b71c1c', '#4a148c', '#1b5e20', '#0d47a1', 'var(--warning-color)'];
const PRESET_TEXT_COLORS = ['var(--bg-white)', 'var(--text-color)', '#ffeb3b', '#f44336', 'var(--success-color)', '#00e676', '#00e5ff', '#ffd700', '#ff80ab'];

const STATIC_ROUTES = [
  { label: 'Home Page (/)', value: '/' },
  { label: 'Shop All Sarees (/shop)', value: '/shop' },
  { label: 'Sale & Discounts (/sale)', value: '/sale' },
  { label: 'New Arrivals (/new-arrivals)', value: '/new-arrivals' },
  { label: 'Best Sellers (/shop?sort=bestsellers)', value: '/shop?sort=bestsellers' },
  { label: 'Bridal Collection (/collections/bridal)', value: '/collections/bridal' },
  { label: 'Wedding Collection (/collections/wedding)', value: '/collections/wedding' },
  { label: 'My Cart (/cart)', value: '/cart' },
  { label: 'My Wishlist (/wishlist)', value: '/wishlist' },
  { label: 'My Account (/profile)', value: '/profile' }
];

function AnnouncementManager({ sectionData, onUpdate, onSave }) {
  const { masterData } = useAdminData ? useAdminData() : { masterData: {} };

  // Generate dynamic route options from website master data
  const dynamicRouteOptions = useMemo(() => {
    const list = [...STATIC_ROUTES];

    // Master Data Fabrics
    if (masterData?.fabrics && Array.isArray(masterData.fabrics)) {
      masterData.fabrics.forEach(f => {
        const slug = f.name.toLowerCase().replace(/\s+/g, '-');
        list.push({ label: `Fabric: ${f.name} (/shop?fabric=${slug})`, value: `/shop?fabric=${slug}` });
      });
    }

    // Master Data Occasions
    if (masterData?.occasions && Array.isArray(masterData.occasions)) {
      masterData.occasions.forEach(o => {
        const slug = o.name.toLowerCase().replace(/\s+/g, '-');
        list.push({ label: `Occasion: ${o.name} (/shop?occasion=${slug})`, value: `/shop?occasion=${slug}` });
      });
    }

    // Master Data Collections
    if (masterData?.collections && Array.isArray(masterData.collections)) {
      masterData.collections.forEach(c => {
        const slug = c.name.toLowerCase().replace(/\s+/g, '-');
        list.push({ label: `Collection: ${c.name} (/collections/${slug})`, value: `/collections/${slug}` });
      });
    }

    list.push({ label: 'Custom URL...', value: 'custom' });
    return list;
  }, [masterData]);

  // Extract items list from sectionData
  const rawItems = sectionData?.items && Array.isArray(sectionData.items) && sectionData.items.length > 0 
    ? sectionData.items 
    : DEFAULT_ANNOUNCEMENTS;

  const [items, setItems] = useState(rawItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scheduleFilter, setScheduleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('order');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'
  const [editingItem, setEditingItem] = useState(null);
  const [isCustomLink, setIsCustomLink] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    text: '',
    icon: '🚚',
    link: '/shop',
    linkTarget: '_self',
    duration: 5,
    startDate: '',
    endDate: '',
    bgColor: 'var(--text-color)',
    textColor: 'var(--bg-white)',
    iconColor: '#ffeb3b',
    status: 'active',
    sortOrder: 1
  });

  // Sync back to parent section data & database
  const saveItemsList = (nextItems) => {
    setItems(nextItems);
    const updatedSectionData = {
      ...sectionData,
      enabled: sectionData?.enabled ?? true,
      text: nextItems.find(x => x.status === 'active')?.text || nextItems[0]?.text || '',
      items: nextItems
    };
    if (onUpdate) onUpdate(updatedSectionData);
    if (onSave) onSave(updatedSectionData);
  };

  // Helper to determine Schedule Status
  const getScheduleStatus = (item) => {
    if (!item.startDate && !item.endDate) return 'Always';
    const now = new Date();
    const start = item.startDate ? new Date(item.startDate) : null;
    const end = item.endDate ? new Date(item.endDate) : null;

    if (start && now < start) return 'Future';
    if (end && now > end) return 'Expired';
    return 'Running';
  };

  // Toggle Active/Draft Status
  const handleToggleStatus = (id) => {
    const next = items.map(item => item.id === id ? { ...item, status: item.status === 'active' ? 'draft' : 'active' } : item);
    saveItemsList(next);
  };

  // Move Order
  const handleMoveOrder = (id, direction) => {
    const index = items.findIndex(x => x.id === id);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const next = [...items];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // Re-index sort order
    next.forEach((it, i) => { it.sortOrder = i + 1; });
    saveItemsList(next);
  };

  // Delete Announcement
  const handleDelete = (id) => {
    const target = items.find(x => x.id === id);
    if (!target) return;
    if (window.confirm(`Are you sure you want to delete announcement "${target.text}"?`)) {
      const next = items.filter(x => x.id !== id);
      next.forEach((it, i) => { it.sortOrder = i + 1; });
      saveItemsList(next);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingItem(null);
    setIsCustomLink(false);
    setFormData({
      id: `anc_${Date.now()}`,
      text: '',
      icon: '🚚',
      link: '/shop',
      linkTarget: '_self',
      duration: 5,
      startDate: '',
      endDate: '',
      bgColor: 'var(--text-color)',
      textColor: 'var(--bg-white)',
      iconColor: '#ffeb3b',
      status: 'active',
      sortOrder: items.length + 1
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setEditingItem(item);
    const linkExists = dynamicRouteOptions.some(r => r.value === item.link);
    setIsCustomLink(!linkExists);
    setFormData({ ...item });
    setShowModal(true);
  };

  // Open View Modal
  const handleOpenView = (item) => {
    setModalMode('view');
    setEditingItem(item);
    const linkExists = dynamicRouteOptions.some(r => r.value === item.link);
    setIsCustomLink(!linkExists);
    setFormData({ ...item });
    setShowModal(true);
  };

  // Submit Modal Form
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert("Please enter the announcement text.");
      return;
    }

    let nextItems;
    if (modalMode === 'add') {
      nextItems = [...items, { ...formData }];
    } else {
      nextItems = items.map(x => x.id === formData.id ? { ...formData } : x);
    }

    nextItems.forEach((it, i) => { if (!it.sortOrder) it.sortOrder = i + 1; });
    saveItemsList(nextItems);
    setShowModal(false);
  };

  // Filter & Sort Logic
  const filteredItems = items.filter(item => {
    // Search
    if (searchTerm && !item.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    // Status
    if (statusFilter === 'Active' && item.status !== 'active') return false;
    if (statusFilter === 'Draft' && item.status !== 'draft') return false;
    // Schedule
    const sch = getScheduleStatus(item);
    if (scheduleFilter !== 'All' && sch !== scheduleFilter) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'duration') return b.duration - a.duration;
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  return (
    <div className={styles.container}>
      
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.breadcrumb}>
          <span>Homepage CMS</span> &gt; <span className={styles.breadcrumbActive}>Announcement Bar</span>
        </div>
        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <FiPlus /> + Add Announcement
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterControls}>
          <div className={styles.searchBox}>
            <FiSearch style={{ color: '#888' }} />
            <input 
              type="text" 
              placeholder="Search announcement text..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft / Inactive</option>
          </select>

          <select className={styles.filterSelect} value={scheduleFilter} onChange={(e) => setScheduleFilter(e.target.value)}>
            <option value="All">All Schedules</option>
            <option value="Always">Always</option>
            <option value="Running">Running</option>
            <option value="Future">Future</option>
            <option value="Expired">Expired</option>
          </select>

          <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="order">Sort by Order</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>

        <div className={styles.totalBadge}>
          Total : {filteredItems.length} Announcements
        </div>
      </div>

      {/* Data Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                <th>Announcement Text</th>
                <th style={{ width: '90px' }}>Duration</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '100px' }}>Schedule</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Order</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const schedule = getScheduleStatus(item);
                  return (
                    <tr key={item.id}>
                      {/* Icon */}
                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.iconCell}>
                          {item.icon || '📢'}
                        </div>
                      </td>

                      {/* Announcement Text */}
                      <td>
                        <div className={styles.textCell}>
                          <span className={styles.textTitle}>{item.text}</span>
                          {item.link && (
                            <span className={styles.textMeta}>
                              Link: {item.link} ({item.linkTarget || '_self'})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td>
                        <span className={styles.durationBadge}>
                          {item.duration || 5} sec
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span 
                          className={item.status === 'active' ? styles.statusActive : styles.statusDraft}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(item.id)}
                          title="Click to toggle status"
                        >
                          {item.status === 'active' ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td>
                        <span className={
                          schedule === 'Always' ? styles.schAlways :
                          schedule === 'Running' ? styles.schRunning :
                          schedule === 'Future' ? styles.schFuture : styles.schExpired
                        }>
                          {schedule}
                        </span>
                      </td>

                      {/* Order Controls */}
                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.orderControls}>
                          <button className={styles.orderBtn} onClick={() => handleMoveOrder(item.id, 'up')} disabled={idx === 0}>
                            <FiChevronUp />
                          </button>
                          <span className={styles.orderBadge}>{item.sortOrder || idx + 1}</span>
                          <button className={styles.orderBtn} onClick={() => handleMoveOrder(item.id, 'down')} disabled={idx === filteredItems.length - 1}>
                            <FiChevronDown />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionBtns}>
                          <button className={`${styles.iconBtn} ${styles.viewBtn}`} onClick={() => handleOpenView(item)} title="Quick View">
                            <FiEye />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.editBtn}`} onClick={() => handleOpenEdit(item)} title="Edit Announcement">
                            <FiEdit2 />
                          </button>
                          <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(item.id)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <FiAlertCircle style={{ fontSize: '24px', color: 'var(--primary-color)', marginBottom: '8px' }} />
                    <p>No announcements found matching the active filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit / View Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h3>
                {modalMode === 'add' ? 'Add New Announcement' : modalMode === 'edit' ? 'Edit Announcement' : 'Announcement Preview'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className={styles.modalBody}>
                
                {/* Text */}
                <div className={styles.formGroup}>
                  <label>Announcement Text *</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    value={formData.text}
                    disabled={modalMode === 'view'}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="e.g. Free Shipping Above ₹999"
                  />
                </div>

                {/* Icon Grid */}
                <div className={styles.formGroup}>
                  <label>Select Icon</label>
                  <div className={styles.iconGrid}>
                    {AVAILABLE_ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        disabled={modalMode === 'view'}
                        className={`${styles.iconOption} ${formData.icon === ic ? styles.iconOptionSelected : ''}`}
                        onClick={() => setFormData({ ...formData, icon: ic })}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Link Dropdown & Target */}
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label>Destination Link Page</label>
                    <select 
                      className={styles.input}
                      value={isCustomLink ? 'custom' : formData.link}
                      disabled={modalMode === 'view'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setIsCustomLink(true);
                        } else {
                          setIsCustomLink(false);
                          setFormData({ ...formData, link: val });
                        }
                      }}
                    >
                      {dynamicRouteOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {isCustomLink && (
                      <input 
                        type="text" 
                        className={styles.input}
                        style={{ marginTop: '6px' }}
                        value={formData.link}
                        disabled={modalMode === 'view'}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="Enter custom URL (e.g. https://... or /custom)"
                      />
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Open Link In</label>
                    <select 
                      className={styles.input}
                      value={formData.linkTarget}
                      disabled={modalMode === 'view'}
                      onChange={(e) => setFormData({ ...formData, linkTarget: e.target.value })}
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Sort Order */}
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label>Display Duration (Seconds)</label>
                    <input 
                      type="number" 
                      min="2"
                      max="30"
                      className={styles.input}
                      value={formData.duration}
                      disabled={modalMode === 'view'}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Sort Order</label>
                    <input 
                      type="number" 
                      min="1"
                      className={styles.input}
                      value={formData.sortOrder}
                      disabled={modalMode === 'view'}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Schedule Dates */}
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label>Start Date & Time (Optional)</label>
                    <input 
                      type="datetime-local" 
                      className={styles.input}
                      value={formData.startDate || ''}
                      disabled={modalMode === 'view'}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>End Date & Time (Optional)</label>
                    <input 
                      type="datetime-local" 
                      className={styles.input}
                      value={formData.endDate || ''}
                      disabled={modalMode === 'view'}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Background & Text Colors */}
                <div className={styles.gridTwo}>
                  <div className={styles.formGroup}>
                    <label>Background Color</label>
                    <div className={styles.colorPills}>
                      {PRESET_BG_COLORS.map(col => (
                        <span
                          key={col}
                          className={`${styles.colorPill} ${formData.bgColor === col ? styles.colorPillSelected : ''}`}
                          style={{ backgroundColor: col }}
                          onClick={() => modalMode !== 'view' && setFormData({ ...formData, bgColor: col })}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={formData.bgColor || 'var(--text-color)'}
                        disabled={modalMode === 'view'}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Text Color</label>
                    <div className={styles.colorPills}>
                      {PRESET_TEXT_COLORS.map(col => (
                        <span
                          key={col}
                          className={`${styles.colorPill} ${formData.textColor === col ? styles.colorPillSelected : ''}`}
                          style={{ backgroundColor: col, border: col === 'var(--bg-white)' ? '1px solid #ccc' : '2px solid transparent' }}
                          onClick={() => modalMode !== 'view' && setFormData({ ...formData, textColor: col })}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={formData.textColor || 'var(--bg-white)'}
                        disabled={modalMode === 'view'}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Banner Mockup Preview */}
                <div className={styles.formGroup}>
                  <label>Live Banner Preview</label>
                  <div 
                    className={styles.previewBanner}
                    style={{
                      backgroundColor: formData.bgColor || 'var(--text-color)',
                      color: formData.textColor || 'var(--bg-white)'
                    }}
                  >
                    <span>{formData.icon || '🚚'}</span>
                    <span style={{ color: formData.textColor || 'var(--bg-white)' }}>
                      {formData.text || 'Sample Announcement Text'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button type="submit" className={styles.saveBtn}>
                    {modalMode === 'add' ? 'Add Announcement' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AnnouncementManager;
