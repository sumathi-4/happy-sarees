import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiSearch, FiBell, FiChevronDown, FiChevronUp, FiLayout, 
  FiPackage, FiHome, FiShoppingBag, FiUsers, FiPercent, FiBarChart2, 
  FiSettings, FiLogOut, FiUser, FiHelpCircle, FiAward, FiX 
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/AdminLayout.module.css';
import logoImg from '../../../userhttps://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';

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
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiLayout /> },
    { label: 'Products', path: '/products', icon: <FiPackage />, hasDropdown: true },
    { label: 'Homepage CMS', path: '/homepage', icon: <FiHome /> },
    { label: 'Orders', path: '/orders', icon: <FiShoppingBag />, hasDropdown: true },
    { label: 'Customers', path: '/customers', icon: <FiUsers /> },
    { label: 'Coupons', path: '/coupons', icon: <FiPercent /> },
    { label: 'Reports', path: '/reports', icon: <FiBarChart2 />, hasDropdown: true },
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
    if (path.includes('coupons')) return ['Home', 'Coupons'];
    if (path.includes('reports')) return ['Home', 'Reports'];
    if (path.includes('settings')) return ['Home', 'Settings'];
    return ['Home', 'Admin'];
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('products')) return 'Products Management';
    if (path.includes('master-data')) return 'Master Data Management';
    if (path.includes('homepage')) return 'Homepage Curation';
    if (path.includes('orders')) return 'Orders Overview';
    if (path.includes('customers')) return 'Customers Directory';
    if (path.includes('coupons')) return 'Coupons & Offers';
    if (path.includes('reports')) return 'Sales Reports';
    if (path.includes('settings')) return 'Admin Settings';
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
            <img src={logoImg} alt="Happy Sarees" className={styles.logoImg} />
            {!isSidebarCollapsed && <span className={styles.logoText}>Happy Sarees</span>}
          </Link>
          {isMobileOpen && (
            <button className={styles.toggleBtn} onClick={() => setIsMobileOpen(false)}>
              <FiX />
            </button>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className={styles.adminProfileBox}>
            <img src={adminUser?.avatar || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'} alt={adminUser?.name} className={styles.adminAvatar} />
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
                          <span style={{ marginRight: '8px' }}>•</span> Products
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/master-data" 
                          className={`${styles.menuItem} ${location.pathname === '/master-data' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Master Data
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/ratings-reviews" 
                          className={`${styles.menuItem} ${location.pathname === '/ratings-reviews' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Ratings & Reviews
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              );
            }

            if (item.label === 'Reports') {
              const isActive = location.pathname.startsWith('/reports');
              return (
                <li key={i}>
                  <div 
                    className={`${styles.menuItem} ${isActive && !isSidebarCollapsed ? styles.menuParentActive : ''}`}
                    onClick={() => setIsReportsExpanded(!isReportsExpanded)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.menuItemLink}>
                      <span className={styles.menuIcon}>{item.icon}</span>
                      {(!isSidebarCollapsed || isMobileOpen) && (
                        <span className={styles.menuItemText}>{item.label}</span>
                      )}
                    </div>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      isReportsExpanded ? <FiChevronUp className={styles.menuChevron} /> : <FiChevronDown className={styles.menuChevron} />
                    )}
                  </div>
                  {isReportsExpanded && (!isSidebarCollapsed || isMobileOpen) && (
                    <ul style={{ listStyle: 'none', paddingLeft: '20px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>
                        <Link 
                          to="/reports" 
                          className={`${styles.menuItem} ${location.pathname === '/reports' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Overview
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/reports/sales" 
                          className={`${styles.menuItem} ${location.pathname === '/reports/sales' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Sales Report
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/reports/products" 
                          className={`${styles.menuItem} ${location.pathname === '/reports/products' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Products Report
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/reports/customers" 
                          className={`${styles.menuItem} ${location.pathname === '/reports/customers' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Customers Report
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/reports/orders" 
                          className={`${styles.menuItem} ${location.pathname === '/reports/orders' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Orders Report
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
                          <span style={{ marginRight: '8px' }}>•</span> Store Settings
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/settings/profile" 
                          className={`${styles.menuItem} ${location.pathname === '/settings/profile' ? styles.menuActive : ''}`}
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          <span style={{ marginRight: '8px' }}>•</span> Profile Settings
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
              <img src={adminUser?.avatar || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'} alt="Admin" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#2b2b2b' }}>{adminUser?.name}</span>
                <span style={{ fontSize: '9px', color: '#999999' }}>{adminUser?.role}</span>
              </div>
            </div>
          ) : (
            <img src={adminUser?.avatar || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'} alt="Admin" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
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
              <img src={logoImg} alt="Happy Sarees" className={styles.logoImg} style={{ marginRight: '8px' }} />
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
              <img src={adminUser?.avatar || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'} alt="Admin" className={styles.adminAvatar} style={{ border: '2px solid rgba(209,27,105,0.1)' }} />
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
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#999999' }}>
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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#2b2b2b', marginBottom: '6px' }}>{getPageTitle()}</h1>
            <nav style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#999999' }}>
              {breadcrumbs.map((bc, i) => (
                <span key={i}>
                  {bc}
                  {i < breadcrumbs.length - 1 && <span style={{ margin: '0 8px' }}>&gt;</span>}
                </span>
              ))}
            </nav>
          </div>

          <div style={{
            background: '#ffffff', padding: '10px 18px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)',
            fontSize: '13px', fontWeight: 600, color: '#666666', display: 'flex', alignItems: 'center', gap: '8px'
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
