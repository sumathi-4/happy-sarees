// ============================================================
//  seller/src/api/sellerApi.js
//  Centralized API client for all seller backend calls
// ============================================================

const API_BASE = 'http://localhost:5001/api/sellers';

function getToken() {
  return localStorage.getItem('hs_seller_token');
}

async function sellerRequest(method, path, body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      // Clear credentials if expired/unauthorized
      localStorage.removeItem('hs_seller_token');
      localStorage.removeItem('hs_seller_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const err = new Error(data.message || 'API request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Convenience request object
const request = {
  get:    (path)       => sellerRequest('GET',    path),
  post:   (path, body) => sellerRequest('POST',   path, body),
  put:    (path, body) => sellerRequest('PUT',    path, body),
  delete: (path)       => sellerRequest('DELETE', path),
};

export const sellerApi = {
  // Auth
  register: (data) => request.post('/register', data),
  login: (email, password) => request.post('/login', { email, password }),
  getMe: () => request.get('/me'),
  logout: () => request.post('/logout', {}),

  // Dashboard & Analytics
  getDashboardSummary: () => request.get('/dashboard/summary'),
  getSalesAnalytics: () => request.get('/analytics/sales'),
  getPayoutsAnalytics: () => request.get('/analytics/payouts'),

  // Products
  getCategories: () => request.get('/categories'),
  getProducts: (params = {}) => request.get('/products?' + new URLSearchParams(params)),
  getProductById: (id) => request.get(`/products/${id}`),
  createProduct: (data) => request.post('/products', data),
  updateProduct: (id, data) => request.put(`/products/${id}`, data),
  deleteProduct: (id) => request.delete(`/products/${id}`),
  uploadImage: (id, image) => request.post(`/products/${id}/images`, { image }),

  // Orders
  getOrders: (params = {}) => request.get('/orders?' + new URLSearchParams(params)),
  getOrderById: (id) => request.get(`/orders/${id}`),
  updateOrderItemStatus: (itemId, status, trackingNumber) => request.put(`/orders/${itemId}/status`, { status, trackingNumber }),
  updateOrderItemPaymentStatus: (itemId, paymentStatus) => request.put(`/orders/${itemId}/payment-status`, { paymentStatus }),

  // Notifications
  getNotifications: () => request.get('/notifications'),
  markNotificationRead: (id) => request.put(`/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => request.put('/notifications/read-all', {}),

  // Profile & Credentials
  getProfile: () => request.get('/profile'),
  updateProfile: (data) => request.put('/profile', data),
  updatePassword: (currentPassword, newPassword) => request.put('/settings/password', { currentPassword, newPassword }),
};
