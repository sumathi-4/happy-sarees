import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiMenu, FiBell, FiChevronDown, FiChevronUp, FiLayout, 
  FiPackage, FiShoppingBag, FiBarChart2, FiSettings, 
  FiLogOut, FiUser, FiX, FiCheckCircle 
} from 'react-icons/fi';
import { useSellerAuth } from '../context/SellerAuthContext';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/SellerLayout.module.css';

const LOGO_URL = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';

function SellerLayout() {
  const { sellerUser, logout } = useSellerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications for the popover
  useEffect(() => {
    async function loadNotifications() {
      if (sellerUser) {
        try {
          const res = await sellerApi.getNotifications();
          if (res.success) {
            setNotifications(res.notifications);
          }
        } catch (err) {
          console.error('Failed to load notifications in layout:', err);
        }
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [sellerUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiLayout /> },
    { label: 'Products', path: '/products', icon: <FiPackage /> },
    { label: 'Orders', path: '/orders', icon: <FiShoppingBag /> },
    { label: 'Analytics', path: '/analytics', icon: <FiBarChart2 /> },
    { label: 'Notifications', path: '/notifications', icon: <FiBell />, badgeCount: unreadCount },
    { label: 'Profile', path: '/profile', icon: <FiUser /> },
    { label: 'Settings', path: '/settings', icon: <FiSettings /> }
  ];

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return ['Home', 'Dashboard'];
    if (path.includes('products')) return ['Home', 'Products'];
    if (path.includes('orders')) return ['Home', 'Orders'];
    if (path.includes('analytics')) return ['Home', 'Analytics'];
    if (path.includes('notifications')) return ['Home', 'Notifications'];
    if (path.includes('profile')) return ['Home', 'Profile'];
    if (path.includes('settings')) return ['Home', 'Settings'];
    return ['Home', 'Seller Studio'];
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Seller Dashboard';
    if (path.includes('products/new')) return 'List New Saree';
    if (path.includes('products/') && path.includes('/edit')) return 'Edit Saree Details';
    if (path.includes('products')) return 'Saree Products Roster';
    if (path.includes('orders')) return 'Orders Fulfilment';
    if (path.includes('analytics')) return 'Performance Analytics';
    if (path.includes('notifications')) return 'Notifications Inbox';
    if (path.includes('profile')) return 'Business Profile';
    if (path.includes('settings')) return 'Security Settings';
    return 'Seller Studio';
  };

  const markAllRead = async () => {
    try {
      await sellerApi.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className={styles.layoutWrapper}>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', zIndex: 98
          }} 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''} ${isMobileOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/dashboard" className={styles.logoArea}>
            <img src={LOGO_URL} alt="Happy Sarees" className={styles.logoImg} />
          </Link>
          {isMobileOpen && (
            <button className={styles.toggleBtn} onClick={() => setIsMobileOpen(false)} style={{ color: '#fff' }}>
              <FiX />
            </button>
          )}
        </div>

        {/* Identity card showing store name / owner */}
        {!isSidebarCollapsed && sellerUser && (
          <div className={styles.sellerProfileBox}>
            {sellerUser.storeLogoUrl ? (
              <img src={sellerUser.storeLogoUrl} alt={sellerUser.storeName} className={styles.sellerAvatar} />
            ) : (
              <div className={styles.sellerAvatarPlaceholder}>
                {(sellerUser.storeName || '').charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.sellerInfoText}>
              <span className={styles.sellerName}>{sellerUser.storeName}</span>
              <span className={styles.sellerRole}>Approved Vendor</span>
            </div>
          </div>
        )}

        <ul className={styles.sidebarMenu}>
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={i}>
                <Link 
                  to={item.path} 
                  className={`${styles.menuItem} ${isActive ? styles.menuActive : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className={styles.menuItemLink}>
                    <span className={styles.menuIcon}>
                      {item.icon}
                    </span>
                    {(!isSidebarCollapsed || isMobileOpen) && (
                      <span className={styles.menuItemText}>{item.label}</span>
                    )}
                  </div>
                  {(!isSidebarCollapsed || isMobileOpen) && item.badgeCount > 0 && (
                    <span className={styles.badgeCount} style={{ position: 'static', border: 'none', height: '20px', minWidth: '20px' }}>
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer (User details + quick logout) */}
        <div className={styles.sidebarFooter}>
          {(!isSidebarCollapsed || isMobileOpen) && sellerUser && (
            <div className={styles.footerUser}>
              {sellerUser.storeLogoUrl ? (
                <img src={sellerUser.storeLogoUrl} alt="" className={styles.footerUserAvatar} />
              ) : (
                <div className={styles.sellerAvatarPlaceholder} style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                  {(sellerUser.storeName || '').charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.footerUserText}>
                <span className={styles.footerUserName}>{sellerUser.ownerName}</span>
                <span className={styles.footerUserRole}>{sellerUser.email}</span>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout} title="Log Out">
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`${styles.mainContainer} ${isSidebarCollapsed ? styles.mainContainerCollapsed : ''}`}>
        
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.toggleBtn} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
              <FiMenu />
            </button>
            
            <div className={styles.breadcrumbs}>
              {breadcrumbs.map((bc, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                    <span className={isLast ? styles.breadcrumbActive : ''}>
                      {bc}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className={styles.topbarRight}>
            
            {/* Notification bell popover */}
            <div className={styles.notifWrapper}>
              <button className={styles.iconBadge} onClick={() => setIsNotifOpen(!isNotifOpen)}>
                <FiBell />
                {unreadCount > 0 && (
                  <span className={styles.badgeCount}>{unreadCount}</span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsNotifOpen(false)} />
                  <div className={styles.popoverDropdown}>
                    <div className={styles.popoverHeader}>
                      <span className={styles.popoverTitle}>Notifications</span>
                      {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    
                    <ul className={styles.notifList}>
                      {notifications.length === 0 ? (
                        <li className={styles.emptyNotifs}>No notifications.</li>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <li 
                            key={n.id} 
                            className={`${styles.notifItem} ${!n.isRead ? styles.notifUnread : ''}`}
                            onClick={async () => {
                              try {
                                if (!n.isRead) {
                                  await sellerApi.markNotificationRead(n.id);
                                  setNotifications(notifications.map(not => not.id === n.id ? { ...not, isRead: true } : not));
                                }
                                setIsNotifOpen(false);
                                navigate('/notifications');
                              } catch(e) { console.error(e); }
                            }}
                          >
                            <div className={styles.notifItemTitle}>{n.title}</div>
                            <div className={styles.notifItemMsg}>{n.message}</div>
                            <span className={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </li>
                        ))
                      )}
                    </ul>

                    <Link to="/notifications" className={styles.viewAllLink} onClick={() => setIsNotifOpen(false)}>
                      View All Inbox
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            {sellerUser && (
              <div className={styles.profileWrapper}>
                <button className={styles.profileTrigger} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  {sellerUser.storeLogoUrl ? (
                    <img src={sellerUser.storeLogoUrl} alt="" className={styles.profileAvatar} />
                  ) : (
                    <div className={styles.sellerAvatarPlaceholder} style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                      {(sellerUser.storeName || '').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={styles.profileName}>{sellerUser.storeName}</span>
                  <FiChevronDown className={styles.chevronIcon} />
                </button>

                {isProfileOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setIsProfileOpen(false)} />
                    <ul className={styles.profileDropdown}>
                      <li>
                        <Link to="/profile" className={styles.profileDropdownItem} onClick={() => setIsProfileOpen(false)}>
                          <FiUser /> Store Profile
                        </Link>
                      </li>
                      <li>
                        <Link to="/settings" className={styles.profileDropdownItem} onClick={() => setIsProfileOpen(false)}>
                          <FiSettings /> Credentials
                        </Link>
                      </li>
                      <li className={styles.profileDropdownDivider} />
                      <li>
                        <div className={styles.profileDropdownItem} onClick={handleLogout} style={{ color: '#FF5252' }}>
                          <FiLogOut /> Log Out
                        </div>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            )}

          </div>
        </header>

        {/* Router Outlet content pages */}
        <main className={styles.contentArea}>
          <Outlet context={{ getPageTitle }} />
        </main>

      </div>
    </div>
  );
}

export default SellerLayout;
