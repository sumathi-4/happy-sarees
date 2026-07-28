import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
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
import Cart from './Cart';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    let isMounted = true;
    api.getMyOrders()
      .then((data) => {
        if (!isMounted) return;
        const rawList = data.success && Array.isArray(data.orders) ? data.orders : (Array.isArray(data.data) ? data.data : []);
        const formatted = rawList.map(o => {
          let addr = o.shipping_address || o.shippingAddress;
          if (typeof addr === 'string') {
            try { addr = JSON.parse(addr); } catch(e) {}
          }
          let addrStr = '';
          if (addr && typeof addr === 'object') {
            addrStr = `${addr.name || addr.fullName || ''} (${addr.label || 'Address'}), ${addr.house ? addr.house + ', ' : ''}${addr.street || addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || 'Tamil Nadu'} - ${addr.pincode || ''}, Phone: ${addr.phone || ''}`.trim();
          } else {
            addrStr = String(addr || 'Address registered on checkout');
          }

          const rawItems = Array.isArray(o.items) ? o.items.filter(i => i && (i.id || i.productName || i.name)) : [];
          const formattedItems = rawItems.map(i => ({
            id: i.id || i.productId || Math.random(),
            name: i.productName || i.name || 'Silk Saree',
            fabric: i.fabric || 'Silk',
            quantity: Number(i.quantity || 1),
            price: Number(i.price || i.price_at_purchase || 0),
            image: i.image || i.image_url || '/src/assets/hero_saree_model.png'
          }));

          return {
            id: o.order_number || o.orderNumber || `HS-ORD-${o.id}`,
            dbId: o.id,
            date: o.created_at || o.createdAt ? new Date(o.created_at || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
            status: o.order_status || o.orderStatus || 'Confirmed',
            paymentStatus: o.payment_status || o.paymentStatus || 'Pending',
            paymentMethod: o.payment_method || o.paymentMethod || 'Pay Online',
            totalPrice: Number(o.total_amount || o.totalAmount || 0),
            shippingAddress: addrStr,
            razorpayPaymentId: o.razorpay_payment_id || o.razorpayPaymentId || '',
            razorpayOrderId: o.razorpay_order_id || o.razorpayOrderId || '',
            trackingNumber: o.tracking_number || o.trackingNumber || '',
            courierName: o.courier_name || o.courierName || '',
            items: formattedItems
          };
        });
        setOrders(formatted);
      })
      .catch((err) => {
        console.log('[Profile] Live orders warning:', err.message);
      });

    api.getAddresses()
      .then((data) => {
        if (!isMounted) return;
        const rawList = data.success && Array.isArray(data.addresses) ? data.addresses : (Array.isArray(data.data) ? data.data : []);
        const formatted = rawList.map(a => ({
          id: a.id,
          label: a.is_default ? 'Home' : 'Work',
          isDefault: a.is_default,
          name: a.full_name || a.name,
          house: a.street_address || a.house,
          street: a.street_address || a.street,
          city: a.city,
          state: a.state || 'Tamil Nadu',
          pincode: a.pincode,
          phone: a.phone
        }));
        setAddresses(formatted);
      })
      .catch((err) => {
        console.log('[Profile] Live addresses warning:', err.message);
      });

    return () => { isMounted = false; };
  }, [activeTab]);

  const userProfile = {
    name: user?.name || user?.email?.split('@')[0] || 'Valued Customer',
    email: user?.email || '',
    phone: user?.phone || '',
    memberTier: user?.memberTier || 'Registered Member',
    rewardPoints: Number(user?.rewardPoints || 0),
    totalSpent: orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
    totalSaved: 0,
    memberSince: '2026',
    pendingOrdersCount: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
    deliveredOrdersCount: orders.filter(o => o.status === 'Delivered').length,
    wishlistCount: Number(wishlistCount || 0),
    cartCount: Number(cartCount || 0),
    addressCount: Number(addresses.length || 0),
    totalOrders: Number(orders.length || 0),
    avatar: user?.avatar || '/src/assets/hero_saree_model.png'
  };

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
                recentOrders={orders}
                addresses={addresses}
                onSelectTab={handleSelectTab}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab orders={orders} />
            )}

            {activeTab === 'wishlist' && (
              <Wishlist />
            )}

            {activeTab === 'cart' && (
              <Cart />
            )}

            {activeTab === 'addresses' && (
              <AddressesTab addresses={addresses} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab />
            )}

            {activeTab === 'profile' && (
              <ProfileTab userProfile={userProfile} />
            )}

            {activeTab === 'password' && (
              <PasswordTab />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
