import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiSearch, FiBell, FiChevronDown, FiChevronUp, FiChevronRight, FiLayout, 
  FiPackage, FiHome, FiShoppingBag, FiUsers, FiPercent, FiBarChart2, 
  FiSettings, FiLogOut, FiUser, FiHelpCircle, FiAward, FiX, FiBriefcase, FiDollarSign
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/AdminLayout.module.css';

const LOGO_URL = '/logo.png';

function AdminLayout() {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { notifications, setNotifications } = useAdminData();

  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [isCampaignsExpanded, setIsCampaignsExpanded] = useState(true);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isSellersExpanded, setIsSellersExpanded] = useState(true);

  const [pendingSellersCount, setPendingSellersCount] = useState(0);
  const [pendingProductsCount, setPendingProductsCount] = useState(0);

  useEffect(() => {
    async function loadCounts() {
      try {
        const [sellersRes, productsRes] = await Promise.all([
          fetch('http://localhost:5001/api/admin/sellers?status=pending', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('hs_admin_token')}` }
          }).then(r => r.json()),
          fetch('http://localhost:5001/api/admin/product-approvals?status=pending', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('hs_admin_token')}` }
          }).then(r => r.json())
        ]);
        if (sellersRes.success) setPendingSellersCount(sellersRes.requests.length);
        if (productsRes.success) setPendingProductsCount(productsRes.products.length);
      } catch (err) {
        console.error('Failed to load sidebar badge counts:', err);
      }
    }
    loadCounts();
    const timer = setInterval(loadCounts, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiLayout /> },
    { label: 'Products', path: '/products', icon: <FiPackage />, hasDropdown: true },
    { label: 'Homepage CMS', path: '/homepage', icon: <FiHome /> },
    { label: 'Orders', path: '/orders', icon: <FiShoppingBag /> },
    { label: 'Customers', path: '/customers', icon: <FiUsers /> },
    { label: 'Sellers', path: '/sellers', icon: <FiBriefcase />, hasDropdown: true },
    { label: 'Payouts', path: '/payouts', icon: <FiDollarSign /> },
    { label: 'Coupons', path: '/coupons', icon: <FiPercent /> },
    { label: 'Campaigns', path: '/campaigns', icon: <FiAward />, hasDropdown: true },
    { label: 'Reports', path: '/reports', icon: <FiBarChart2 /> },
    { label: 'Settings', path: '/settings', icon: <FiSettings />, hasDropdown: true }
  ];

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return ['Home', 'Dashboard'];
    if (path.includes('products')) return ['Home', 'Products'];
    if (path.includes('master-data')) return ['Home', 'Master Data'];
    if (path.includes('homepage')) return ['Home', 'Homepage'];
    if (path.includes('orders')) return ['Home', 'Orders'];
    if (path.includes('customers')) return ['Home', 'Customers'];
    if (path.includes('sellers/requests')) return ['Home', 'Sellers', 'Verification Requests'];
    if (path.includes('sellers/registry')) return ['Home', 'Sellers', 'Registry Roster'];
    if (path.includes('sellers/product-approvals')) return ['Home', 'Sellers', 'Product Approvals'];
    if (path.includes('sellers/master-data-requests')) return ['Home', 'Sellers', 'Data Requests'];
    if (path.includes('payouts')) return ['Home', 'Payouts'];
    if (path.includes('coupons')) return ['Home', 'Coupons'];
    if (path.includes('campaigns/saree-crown')) return ['Home', 'Campaigns', 'Saree Crown'];
    if (path.includes('campaigns')) return ['Home', 'Campaigns'];
    if (path.includes('reports')) return ['Home', 'Reports'];
    if (path.includes('settings')) return ['Home', 'Settings'];
    return ['Home', 'Admin'];
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('products')) return 'Products Management';
    if (path.includes('master-data')) return 'Master Data Management';
    if (path.includes('ratings-reviews')) return 'Ratings & Reviews';
    if (path.includes('homepage')) return 'Homepage Curation';
    if (path.includes('orders')) return 'Orders Overview';
    if (path.includes('customers')) return 'Customers Directory';
    if (path.includes('sellers/requests')) return 'Seller Approvals';
    if (path.includes('sellers/registry')) return 'Seller Registry';
    if (path.includes('sellers/product-approvals')) return 'Product Approvals';
    if (path.includes('sellers/master-data-requests')) return 'Seller Data Requests';
    if (path.includes('payouts')) return 'Payouts Management';
    if (path.includes('coupons')) return 'Coupons & Offers';
    if (path.includes('campaigns/saree-crown')) return '👑 Saree Crown';
    if (path.includes('campaigns')) return 'Campaigns';
    if (path.includes('reports')) return 'Sales Reports';
    if (path.includes('settings/profile')) return 'Profile Settings';
    if (path.includes('settings')) return 'Store Settings';
    return 'Admin Panel';
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className={styles.layoutWrapper}>
      {isMobileOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 98
          }} 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''} ${isMobileOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logoArea}>
            <img src={LOGO_URL} alt="Happy Sarees" className={styles.logoImg} />
          </Link>
          {isMobileOpen && (
            <button className={styles.toggleBtn} onClick={() => setIsMobileOpen(false)}>
              <FiX />
            </button>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className={styles.adminProfileBox}>
            {adminUser?.avatar ? (
              <img
                src={adminUser.avatar}
                alt={adminUser?.name || 'Admin'}
                className={styles.adminAvatar}
              />
            ) : (
              <div className={styles.adminAvatar} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #d11b69, #9c1350)',
                color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                userSelect: 'none', flexShrink: 0
              }}>
                {(adminUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.adminInfoText}>
              <span className={styles.adminName}>{adminUser?.name || 'Admin'}</span>
              <span className={styles.adminRole}>{adminUser?.role || 'Super Admin'}</span>
            </div>
          </div>
        )}

        <ul className={styles.sidebarMenu}>
          {navItems.map((item, i) => {
            if (item.label === 'Products') {
              const isActive = location.pathname.startsWith('/products') || location.pathname === '/master-data';
              return (
                <li key={i}>
                  <div 
                    className={`${styles.menuItem} ${isActive && !isSidebarCollapsed ? styles.menuParentActive : ''}`}
                    onClick={() => setIsProductsExpanded(!isProductsExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.menuItemLink}>
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {(!isSidebarCollapsed || isMobileOpen) && (
                        <span className={styles.menuItemText}>{item.label}</span>
                      )}
                    </div>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      isProductsExpanded ? <FiChevronUp className={styles.menuChevron} /> : <FiChevronDown className={styles.menuChevron} />
                    )}
                  </div>
                  {isProductsExpanded && (!isSidebarCollapsed || isMobileOpen) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>
                        <Link 
                          to="/products" 
                          className={`${styles.menuItem} ${location.pathname === '/products' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Products
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/master-data" 
                          className={`${styles.menuItem} ${location.pathname === '/master-data' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Master Data
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/ratings-reviews" 
                          className={`${styles.menuItem} ${location.pathname === '/ratings-reviews' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Ratings & Reviews
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            if (item.label === 'Campaigns') {
              const isActive = location.pathname.startsWith('/campaigns');
              return (
                <li key={i}>
                  <div 
                    className={`${styles.menuItem} ${isActive && !isSidebarCollapsed ? styles.menuParentActive : ''}`}
                    onClick={() => setIsCampaignsExpanded(!isCampaignsExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.menuItemLink}>
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {(!isSidebarCollapsed || isMobileOpen) && (
                        <span className={styles.menuItemText}>{item.label}</span>
                      )}
                    </div>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      isCampaignsExpanded ? <FiChevronUp className={styles.menuChevron} /> : <FiChevronDown className={styles.menuChevron} />
                    )}
                  </div>
                  {isCampaignsExpanded && (!isSidebarCollapsed || isMobileOpen) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>
                        <Link 
                          to="/campaigns/saree-crown" 
                          className={`${styles.menuItem} ${location.pathname === '/campaigns/saree-crown' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> 👑 Saree Crown
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            if (item.label === 'Sellers') {
              const isActive = location.pathname.startsWith('/sellers');
              return (
                <li key={i}>
                  <div 
                    className={`${styles.menuItem} ${isActive && !isSidebarCollapsed ? styles.menuParentActive : ''}`}
                    onClick={() => setIsSellersExpanded(!isSellersExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.menuItemLink}>
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {(!isSidebarCollapsed || isMobileOpen) && (
                        <span className={styles.menuItemText}>{item.label}</span>
                      )}
                    </div>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {pendingSellersCount > 0 && (
                          <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>{pendingSellersCount}</span>
                        )}
                        {isSellersExpanded ? <FiChevronUp className={styles.menuChevron} /> : <FiChevronDown className={styles.menuChevron} />}
                      </div>
                    )}
                  </div>
                  {isSellersExpanded && (!isSidebarCollapsed || isMobileOpen) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>
                        <Link 
                          to="/sellers/requests" 
                          className={`${styles.menuItem} ${location.pathname === '/sellers/requests' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Requests
                          </span>
                          {pendingSellersCount > 0 && (
                            <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>{pendingSellersCount}</span>
                          )}
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/sellers/registry" 
                          className={`${styles.menuItem} ${location.pathname === '/sellers/registry' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Registry
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/sellers/product-approvals" 
                          className={`${styles.menuItem} ${location.pathname === '/sellers/product-approvals' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Approvals
                          </span>
                          {pendingProductsCount > 0 && (
                            <span style={{ backgroundColor: 'var(--primary-color)', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px' }}>{pendingProductsCount}</span>
                          )}
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/sellers/master-data-requests" 
                          className={`${styles.menuItem} ${location.pathname === '/sellers/master-data-requests' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Data Requests
                          </span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            if (item.label === 'Settings') {
              const isActive = location.pathname.startsWith('/settings');
              return (
                <li key={i}>
                  <div 
                    className={`${styles.menuItem} ${isActive && !isSidebarCollapsed ? styles.menuParentActive : ''}`}
                    onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.menuItemLink}>
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {(!isSidebarCollapsed || isMobileOpen) && (
                        <span className={styles.menuItemText}>{item.label}</span>
                      )}
                    </div>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      isSettingsExpanded ? <FiChevronUp className={styles.menuChevron} /> : <FiChevronDown className={styles.menuChevron} />
                    )}
                  </div>
                  {isSettingsExpanded && (!isSidebarCollapsed || isMobileOpen) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>
                        <Link 
                          to="/settings" 
                          className={`${styles.menuItem} ${location.pathname === '/settings' || location.pathname === '/settings/store' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Store Settings
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/settings/profile" 
                          className={`${styles.menuItem} ${location.pathname === '/settings/profile' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <FiChevronRight style={{ marginRight: '6px', fontSize: '11px', flexShrink: 0 }} /> Profile Settings
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={i}>
                <Link 
                  to={item.path} 
                  className={`${styles.menuItem} ${isActive ? styles.menuActive : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className={styles.menuItemLink}>
                    <span className={styles.menuIcon}>{item.icon}</span>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      <span className={styles.menuItemText}>{item.label}</span>
                    )}
                  </div>
                  {item.hasDropdown && (!isSidebarCollapsed || isMobileOpen) && (
                    <FiChevronDown className={styles.menuChevron} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={styles.sidebarFooter}>
          {(!isSidebarCollapsed || isMobileOpen) ? (
            <div className={styles.footerUser}>
              {adminUser?.avatar ? (
                <img src={adminUser.avatar} alt="Admin" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d11b69, #9c1350)',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  userSelect: 'none', flexShrink: 0
                }}>
                  {(adminUser?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>{adminUser?.name}</span>
                <span style={{ fontSize: '10px', color: '#C5A059' }}>{adminUser?.role}</span>
              </div>
            </div>
          ) : (
            adminUser?.avatar ? (
              <img src={adminUser.avatar} alt="Admin" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #d11b69, #9c1350)',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', flexShrink: 0
              }}>
                {(adminUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )
          )}
          <button onClick={handleLogout} className={styles.footerMenuBtn} title="Logout">
            <FiLogOut />
          </button>
        </div>
      </aside>

      <div className={`${styles.mainContainer} ${isSidebarCollapsed ? styles.mainContainerCollapsed : ''}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.toggleBtn} onClick={() => {
              if (window.innerWidth < 992) {
                setIsMobileOpen(true);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}>
              <FiMenu />
            </button>
            <div className={styles.mobileLogoArea}>
              <img src={LOGO_URL} alt="Happy Sarees" className={styles.logoImg} style={{ marginRight: '8px' }} />
              <span className={styles.logoText} style={{ fontSize: '15px' }}>Happy Sarees</span>
            </div>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input type="text" placeholder="Search here..." className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.topbarRight}>
            <button 
              className={styles.actionIconBtn} 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              title="Notifications"
            >
              <FiBell />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className={styles.badge}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <div 
              className={styles.userDropdownTrigger}
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
            >
              {adminUser?.avatar ? (
                <img src={adminUser.avatar} alt="Admin" className={styles.adminAvatar} style={{ border: '2px solid rgba(209,27,105,0.1)' }} />
              ) : (
                <div className={styles.adminAvatar} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #d11b69, #9c1350)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem',
                  border: '2px solid rgba(209,27,105,0.1)', userSelect: 'none', flexShrink: 0
                }}>
                  {(adminUser?.name || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.headerAdminText}>
                <span className={styles.headerAdminName}>{adminUser?.name || 'Admin'}</span>
                <span className={styles.headerAdminRole}>{adminUser?.role || 'Super Admin'}</span>
              </div>
              <FiChevronDown className={styles.dropdownArrow} />
            </div>
          </div>
        </header>

        {isNotifOpen && (
          <div className={styles.notificationsPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Recent Notifications</span>
              <button 
                className={styles.clearAllBtn}
                onClick={() => setNotifications([])}
              >
                Clear All
              </button>
            </div>
            <ul className={styles.panelList}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <li key={n.id} className={`${styles.notifItem} ${n.read ? styles.notifRead : ''}`}>
                    <span className={`${styles.notifDot} ${!n.read ? styles.notifDotActive : ''}`} />
                    <div className={styles.notifContent}>
                      <span className={styles.notifMessage}>{n.message}</span>
                      <span className={styles.notifTime}>{n.time}</span>
                    </div>
                  </li>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
                  No new notifications
                </div>
              )}
            </ul>
            <div className={styles.panelFooter}>
              <Link to="/coupons" className={styles.viewAllNotifLink} onClick={() => setIsNotifOpen(false)}>
                View All Notifications
              </Link>
            </div>
          </div>
        )}

        {isProfileOpen && (
          <div className={styles.profileDropdownMenu}>
            <Link to="/settings/profile" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
              <FiUser /> Profile Settings
            </Link>
            <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
              <FiSettings /> Store Settings
            </Link>
            <div className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); alert('For support, contact support@happysarees.com'); }}>
              <FiHelpCircle /> Help Support
            </div>
            <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
              <FiLogOut /> Logout
            </div>
          </div>
        )}



        <div style={{ padding: '24px 30px 0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#27189D', fontFamily: 'var(--font-serif), "Playfair Display", serif', margin: 0, letterSpacing: '-0.3px' }}>
            {getPageTitle()}
          </h1>
          <div style={{
            background: 'var(--bg-white)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(43, 18, 32, 0.05)',
            fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            📅 <span>21 July 2026</span>
          </div>
        </div>

        <main className={styles.contentView}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
