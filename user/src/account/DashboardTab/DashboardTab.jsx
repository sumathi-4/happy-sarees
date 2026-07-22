import React from 'react';
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
import { RECOMMENDED_PRODUCTS } from '../../data/mockData';
import styles from './DashboardTab.module.css';

function DashboardTab({ userProfile, recentOrders = [], addresses = [], onSelectTab, onAddToCart }) {
  return (
    <div className={styles.dashboardWrapper}>
      {/* Welcome & Reward Banner */}
      <div className={styles.welcomeRow}>
        <div className={styles.welcomeLeft}>
          <h1 className={styles.welcomeTitle}>
            Welcome back, {userProfile.name}! 👋
          </h1>
          <p className={styles.welcomeSub}>Here's what's happening with your account today.</p>
        </div>

        <div className={styles.rewardCard} onClick={() => onSelectTab('dashboard')}>
          <div className={styles.crownCircle}>👑</div>
          <div className={styles.rewardMeta}>
            <span className={styles.rewardLabel}>My Rewards</span>
            <strong className={styles.rewardPts}>{userProfile.rewardPoints.toLocaleString()} Points</strong>
            <span className={styles.rewardTier}>You are a {userProfile.memberTier}</span>
          </div>
          <FiChevronRight className={styles.arrowIcon} />
        </div>
      </div>

      {/* 5 Stat Cards Grid */}
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

        <div className={styles.statCard} onClick={() => onSelectTab('dashboard')}>
          <div className={styles.statIconBox}>
            <FiAward className={styles.statIcon} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{userProfile.rewardPoints.toLocaleString()}</span>
            <span className={styles.statLabel}>Reward Points</span>
            <span className={styles.statLink}>View Rewards &gt;</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Orders & Recently Viewed */}
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
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <img
                  src={order.items[0]?.image || '/src/assets/hero_saree_model.png'}
                  alt={order.items[0]?.name}
                  className={styles.orderThumb}
                />
                <div className={styles.orderMeta}>
                  <h4 className={styles.orderName}>{order.items[0]?.name}</h4>
                  <span className={styles.orderSub}>Order ID: {order.id}</span>
                  <span className={styles.orderDate}>Placed on: {order.date}</span>
                </div>
                <div className={styles.orderRight}>
                  <strong className={styles.orderPrice}>₹{order.totalPrice.toLocaleString()}</strong>
                  <span className={styles.orderQty}>{order.itemCount} Item</span>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Box: Recently Viewed Carousel */}
        <div className={styles.cardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Recently Viewed</h3>
            <button onClick={() => onSelectTab('wishlist')} className={styles.viewAllBtn}>
              View All &gt;
            </button>
          </div>

          <div className={styles.recGrid}>
            {RECOMMENDED_PRODUCTS.map((prod) => (
              <div key={prod.id} className={styles.recCard}>
                <div className={styles.recImgFrame}>
                  <img src={prod.image} alt={prod.name} className={styles.recImg} />
                  <button className={styles.recHeartBtn}>
                    <FiHeart />
                  </button>
                </div>
                <div className={styles.recMeta}>
                  <h5 className={styles.recTitle}>{prod.name}</h5>
                  <div className={styles.recPriceRow}>
                    <strong className={styles.recPrice}>₹{prod.price.toLocaleString()}</strong>
                    {prod.originalPrice > prod.price && (
                      <span className={styles.recOrigPrice}>₹{prod.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart(prod)}
                    className={styles.recCartBtn}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
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
            {addresses.map((addr) => (
              <div key={addr.id} className={styles.miniAddrCard}>
                <div className={styles.addrHeader}>
                  <strong className={styles.addrLabel}>{addr.label}</strong>
                  {addr.isDefault && <span className={styles.defaultTag}>Default</span>}
                  <FiEdit className={styles.editIcon} />
                </div>
                <p className={styles.addrText}>
                  {addr.house}, {addr.street}, {addr.city} - {addr.pincode}, {addr.state}
                </p>
                <span className={styles.addrPhone}>Ph: {addr.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Summary Box */}
        <div className={styles.cardBox}>
          <h3 className={styles.boxTitle}>Account Summary</h3>
          <div className={styles.summaryRows}>
            <div className={styles.sumRow}>
              <span>Total Orders</span>
              <strong>{userProfile.totalOrders}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>Total Spent</span>
              <strong className={styles.primaryText}>₹{userProfile.totalSpent.toLocaleString()}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>You Saved</span>
              <strong className={styles.greenText}>₹{userProfile.totalSaved.toLocaleString()}</strong>
            </div>
            <div className={styles.sumRow}>
              <span>Member Since</span>
              <strong>{userProfile.memberSince}</strong>
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
            <button onClick={() => onSelectTab('wishlist')} className={styles.promoBtn}>
              Explore Offers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
