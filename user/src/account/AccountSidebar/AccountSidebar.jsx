import React, { useRef, useState } from 'react';
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
  FiLogOut,
  FiCamera,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './AccountSidebar.module.css';

function AccountSidebar({ activeTab, onSelectTab, userProfile, onLogout }) {
  const { updateProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const initial = userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U';
  const hasCustomAvatar = Boolean(userProfile.avatar && typeof userProfile.avatar === 'string' && userProfile.avatar.startsWith('http'));

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be under 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        const res = await updateProfile({ avatar: base64Data });
        setIsUploading(false);
        if (res?.success) {
          alert('Profile picture uploaded and saved successfully!');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleRemoveAvatar = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      try {
        setIsUploading(true);
        const res = await updateProfile({ removeAvatar: true });
        setIsUploading(false);
        if (res?.success) {
          alert('Profile picture removed successfully.');
        }
      } catch (err) {
        setIsUploading(false);
        alert('Failed to remove profile picture.');
      }
    }
  };

  return (
    <div className={styles.sidebarCard}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* User Header Profile Block */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarWrapper}>
            {hasCustomAvatar ? (
              <img src={userProfile.avatar} alt={userProfile.name} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span className={styles.initialText}>{initial}</span>
              </div>
            )}
          </div>

          {/* Camera Upload Overlay Icon */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.cameraBtn}
            title="Upload Profile Picture"
            disabled={isUploading}
          >
            <FiCamera className={styles.cameraIcon} />
          </button>

          {/* Remove / Cancel Avatar Button */}
          {hasCustomAvatar && (
            <button
              onClick={handleRemoveAvatar}
              className={styles.removeBtn}
              title="Remove Profile Picture"
              disabled={isUploading}
            >
              <FiX className={styles.removeIcon} />
            </button>
          )}
        </div>

        <h3 className={styles.userName}>{userProfile.name}</h3>
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
