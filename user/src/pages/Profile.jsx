import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MOCK_USER_PROFILE,
  MOCK_ACCOUNT_ORDERS,
  MOCK_ADDRESSES,
  MOCK_USER_REVIEWS,
  MOCK_NOTIFICATIONS
} from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { PATHS } from '../routes/paths';
import AccountSidebar from '../account/AccountSidebar/AccountSidebar';
import DashboardTab from '../account/DashboardTab/DashboardTab';
import OrdersTab from '../account/OrdersTab/OrdersTab';
import AddressesTab from '../account/AddressesTab/AddressesTab';
import ReviewsTab from '../account/ReviewsTab/ReviewsTab';
import ProfileTab from '../account/ProfileTab/ProfileTab';
import PasswordTab from '../account/PasswordTab/PasswordTab';
import NotificationsTab from '../account/NotificationsTab/NotificationsTab';
import Wishlist from './Wishlist';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  const activeTab = searchParams.get('tab') || 'dashboard';

  const userProfile = user || MOCK_USER_PROFILE;

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleAddToCart = (product) => {
    alert(`"${product.name}" added to shopping bag!`);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your Happy Sarees account?')) {
      logout();
      alert('You have been logged out.');
      navigate(PATHS.LOGIN);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to="/" className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>My Account</span>
        </nav>

        {/* Account Layout Grid */}
        <div className={styles.accountGrid}>
          {/* Left Column: Account Sidebar Navigation */}
          <div className={styles.leftCol}>
            <AccountSidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              userProfile={userProfile}
              onLogout={handleLogout}
            />
          </div>

          {/* Right Column: Active Tab Content */}
          <div className={styles.rightCol}>
            {activeTab === 'dashboard' && (
              <DashboardTab
                userProfile={userProfile}
                recentOrders={MOCK_ACCOUNT_ORDERS}
                addresses={MOCK_ADDRESSES}
                onSelectTab={handleSelectTab}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab orders={MOCK_ACCOUNT_ORDERS} />
            )}

            {activeTab === 'wishlist' && (
              <Wishlist />
            )}

            {activeTab === 'addresses' && (
              <AddressesTab addresses={MOCK_ADDRESSES} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab reviews={MOCK_USER_REVIEWS} />
            )}

            {activeTab === 'profile' && (
              <ProfileTab userProfile={userProfile} />
            )}

            {activeTab === 'password' && (
              <PasswordTab />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab notifications={MOCK_NOTIFICATIONS} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
