import axios from 'axios';

// Centralized Axios Instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request Interceptor: Inject JWT Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Common Error Handling & Token Expiry
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        // Clear token if expired or unauthorized
        localStorage.removeItem('hs_token');
        localStorage.removeItem('hs_user');
      }
      const message = error.response.data?.message || 'Server error occurred.';
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(new Error(error.message || 'Backend network error.'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication APIs
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  googleLogin: (googleData) => axiosInstance.post('/auth/google', googleData),
  getProfile: () => axiosInstance.get('/auth/me'),
  updateProfile: (profileData) => axiosInstance.put('/auth/profile', profileData),
  changePassword: (passwordData) => axiosInstance.put('/auth/change-password', passwordData),

  // Notifications APIs
  getNotifications: () => axiosInstance.get('/notifications'),
  markNotificationsRead: () => axiosInstance.put('/notifications/read-all'),

  // Products APIs
  getProducts: (params = {}) => axiosInstance.get('/products', { params }),
  getProductById: (id) => axiosInstance.get(`/products/${id}`),
  getBestsellers: () => axiosInstance.get('/products/bestsellers'),
  getNewArrivals: () => axiosInstance.get('/products/new-arrivals'),
  getProductVideos: () => axiosInstance.get('/products/videos'),

  // Orders APIs
  createOrder: (orderData) => axiosInstance.post('/orders', orderData),
  getMyOrders: () => axiosInstance.get('/orders/my-orders'),
  cancelOrder: (orderId) => axiosInstance.put(`/orders/${orderId}/cancel`),
  returnOrder: (orderId, reason) => axiosInstance.post(`/orders/${orderId}/return`, { reason }),

  // Wishlist APIs
  getWishlist: () => axiosInstance.get('/wishlist'),
  addToWishlist: (productId) => axiosInstance.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => axiosInstance.delete(`/wishlist/${productId}`),

  // Customer Reviews APIs
  getReviews: (productId) => axiosInstance.get(`/reviews/product/${productId}`),
  getApprovedReviews: () => axiosInstance.get('/reviews/approved'),
  checkReviewEligibility: (productId) => axiosInstance.get(`/reviews/check-eligibility/${productId}`),
  addReview: (productId, reviewData) => axiosInstance.post(`/reviews/product/${productId}`, reviewData),
  getMyReviews: () => axiosInstance.get('/reviews/my-reviews'),
  getPendingReviewProducts: () => axiosInstance.get('/reviews/pending-products'),
  updateReview: (id, reviewData) => axiosInstance.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => axiosInstance.delete(`/reviews/${id}`),

  // User Addresses APIs
  getAddresses: () => axiosInstance.get('/addresses'),
  addAddress: (addressData) => axiosInstance.post('/addresses', addressData),
  deleteAddress: (id) => axiosInstance.delete(`/addresses/${id}`),

  // Cart APIs
  getCart: () => axiosInstance.get('/cart'),
  addToCart: (productId, quantity) => axiosInstance.post('/cart', { productId, quantity }),
  removeFromCart: (productId) => axiosInstance.delete(`/cart/${productId}`),
  clearCart: () => axiosInstance.delete('/cart'),

  // Recently Viewed APIs (Neon DB Persistent)
  getRecentlyViewed: () => axiosInstance.get('/recently-viewed'),
  recordRecentlyViewed: (productId) => axiosInstance.post('/recently-viewed', { productId }),

  // CMS & Announcement Bar & Master Data APIs
  getAnnouncementBar: () => axiosInstance.get('/cms/announcement-bar'),
  getCmsSections: () => axiosInstance.get('/cms/sections'),
  getNavigationMenu: () => axiosInstance.get('/cms/navigation'),
  getMasterData: () => axiosInstance.get('/cms/master-data'),
  getSpecTypes: () => axiosInstance.get('/cms/spec-types'),
  getOccasions: () => axiosInstance.get('/cms/occasions'),

  // Coupon & Offer APIs
  getAvailableCoupons: () => axiosInstance.get('/cms/available-coupons'),
  validateCoupon: (code, orderAmount) => axiosInstance.post('/cms/validate-coupon', { code, orderAmount }),

  // Dynamic Shipping Methods API
  getShippingMethods: () => axiosInstance.get('/cms/shipping-methods'),

  // Dynamic Payment Methods API
  getPaymentMethods: () => axiosInstance.get('/cms/payment-methods'),

  // Razorpay Integration APIs
  getRazorpayKey: () => axiosInstance.get('/payment/razorpay-key'),
  createRazorpayOrder: (payload) => axiosInstance.post('/payment/create-razorpay-order', payload),
  verifyRazorpayPayment: (payload) => axiosInstance.post('/payment/verify-signature', payload),
  recordFailedPayment: (payload) => axiosInstance.post('/payment/record-failed-payment', payload),

  // Saree Crown Campaign APIs
  getSareeCrownCampaign: () => axiosInstance.get('/saree-crown'),
  castSareeCrownVote: (productId) => axiosInstance.post('/saree-crown/vote', { productId }),
  getMySareeCrownVote: () => axiosInstance.get('/saree-crown/my-vote'),
};

export default api;
