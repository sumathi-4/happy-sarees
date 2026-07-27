import React from 'react';
import {
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiMapPin,
  FiStar,
  FiUser,
  FiLock,
  FiBell,
  FiLogOut
} from 'react-icons/fi';
import styles from './AccountSidebar.module.css';

function AccountSidebar({ activeTab, onSelectTab, userProfile, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'orders', label: 'My Orders', icon: FiShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart, badge: userProfile.wishlistCount },
    { id: 'cart', label: 'My Cart', icon: FiShoppingCart, badge: userProfile.cartCount },
    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin, badge: userProfile.addressCount },
    { id: 'reviews', label: 'Reviews & Ratings', icon: FiStar },
    { id: 'profile', label: 'Personal Information', icon: FiUser },
    { id: 'password', label: 'Change Password', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell, badge: 5 },
    { id: 'logout', label: 'Logout', icon: FiLogOut, isLogout: true }
  ];

  return (
    <div className={styles.sidebarCard}>
      {/* User Header Profile Block */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <img src={userProfile.avatar} alt={userProfile.name} className={styles.avatarImg} />
        </div>
        <h3 className={styles.userName}>{userProfile.name}</h3>
        <span className={styles.tierTag}>👑 {userProfile.memberTier}</span>
        <span className={styles.userEmail}>{userProfile.email}</span>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navMenu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => (item.isLogout ? onLogout() : onSelectTab(item.id))}
              className={`${styles.navItem} ${isActive ? styles.activeItem : ''} ${
                item.isLogout ? styles.logoutItem : ''
              }`}
            >
              <div className={styles.itemLeft}>
                <Icon className={styles.navIcon} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={styles.badgePill}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default AccountSidebar;
