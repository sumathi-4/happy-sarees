import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';
import {
  FiShoppingBag,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiAward,
  FiChevronRight,
  FiEdit,
  FiShoppingCart
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import styles from './DashboardTab.module.css';

function DashboardTab({ userProfile, recentOrders = [], addresses = [], onSelectTab }) {
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hs_recently_viewed') || '[]');
      setRecentlyViewed(saved.slice(0, 4));
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, []);
  return (
    <div className={styles.dashboardWrapper}>
      {/* Welcome Banner */}
      <div className={styles.welcomeRow}>
        <div className={styles.welcomeLeft}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {userProfile.name}! 👋
          </h1>
          <p className={styles.welcomeSub}>Here's what's happening with your account today.</p>
        </div>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} onClick={() => onSelectTab('orders')}>
          <div className={styles.statIconBox}>
            <FiShoppingBag className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>0{userProfile.pendingOrdersCount}</span>
            <span className={styles.statLabel}>Pending Orders</span>
            <span className={styles.statLink}>View Details &gt;</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => onSelectTab('orders')}>
          <div className={styles.statIconBox}>
            <FiPackage className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{userProfile.deliveredOrdersCount}</span>
            <span className={styles.statLabel}>Delivered Orders</span>
            <span className={styles.statLink}>View Details &gt;</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => onSelectTab('wishlist')}>
          <div className={styles.statIconBox}>
            <FiHeart className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{userProfile.wishlistCount}</span>
            <span className={styles.statLabel}>Wishlist Items</span>
            <span className={styles.statLink}>View Wishlist &gt;</span>
          </div>
        </div>

        <div className={styles.statCard} onClick={() => onSelectTab('addresses')}>
          <div className={styles.statIconBox}>
            <FiMapPin className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>0{userProfile.addressCount}</span>
            <span className={styles.statLabel}>Saved Addresses</span>
            <span className={styles.statLink}>Manage Addresses &gt;</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Orders */}
      <div className={styles.middleGrid}>
        {/* Left Box: Recent Orders */}
        <div className={styles.cardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Recent Orders</h3>
            <button onClick={() => onSelectTab('orders')} className={styles.viewAllBtn}>
              View All Orders &gt;
            </button>
          </div>

          <div className={styles.ordersList}>
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <img
                    src={order.items?.[0]?.image || 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'}
                    alt={order.items?.[0]?.name || 'Saree'}
                    className={styles.orderThumb}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg'; }}
                  />
                  <div className={styles.orderMeta}>
                    <h4 className={styles.orderName}>{order.items?.[0]?.name || 'Silk Saree'}</h4>
                    <span className={styles.orderSub}>Order ID: {order.id}</span>
                    <span className={styles.orderDate}>Placed on: {order.date}</span>
                  </div>
                  <div className={styles.orderRight}>
                    <strong className={styles.orderPrice}>₹{Number(order.totalPrice || 0).toLocaleString()}</strong>
                    <span className={styles.orderQty}>{order.items?.length || 1} Item</span>
                    <span className={`${styles.statusBadge} ${styles[(order.status || 'Processing').toLowerCase()]}`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No recent orders placed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Saved Addresses, Account Summary, Promo Banner */}
      <div className={styles.bottomGrid}>
        {/* Saved Addresses Box */}
        <div className={styles.cardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Saved Addresses</h3>
            <button onClick={() => onSelectTab('addresses')} className={styles.viewAllBtn}>
              View All Addresses &gt;
            </button>
          </div>

          <div className={styles.addressesPreviewList}>
            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div key={addr.id} className={styles.miniAddrCard}>
                  <div className={styles.addrHeader}>
                    <strong className={styles.addrLabel}>{addr.label || 'Home'}</strong>
                    {addr.isDefault && <span className={styles.defaultTag}>Default</span>}
                    <FiEdit className={styles.editIcon} />
                  </div>
                  <p className={styles.addrText}>
                    {addr.house || addr.streetAddress}, {addr.city} - {addr.pincode}, {addr.state || 'Tamil Nadu'}
                  </p>
                  <span className={styles.addrPhone}>Ph: {addr.phone}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#666' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>No saved addresses yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Summary Box */}
        <div className={styles.cardBox}>
          <h3 className={styles.boxTitle}>Account Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.sumRow}>
              <span>Total Orders</span>
              <strong>{userProfile.totalOrders || 0}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>Total Spent</span>
              <strong className={styles.primaryText}>₹{(Number(userProfile.totalSpent) || 0).toLocaleString()}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>You Saved</span>
              <strong className={styles.greenText}>₹{(Number(userProfile.totalSaved) || 0).toLocaleString()}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>Member Since</span>
              <strong>{userProfile.memberSince || '2026'}</strong>
            </div>
          </div>
        </div>

        {/* Exclusive Promo Banner */}
        <div className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <h4 className={styles.promoTitle}>Exclusive For You 🎉</h4>
            <p className={styles.promoSub}>
              Enjoy special offers and early access to new saree collections.
            </p>
            <button onClick={() => navigate(PATHS.SALE)} className={styles.promoBtn}>
              Explore Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
