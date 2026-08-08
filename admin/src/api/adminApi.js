// ============================================================
//  admin/src/api/adminApi.js
//  Centralized API client for all admin backend calls
// ============================================================

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api/admin' : `${window.location.origin}/api/admin`;

function getToken() {
  return localStorage.getItem('hs_admin_token');
}

async function adminRequest(method, path, body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('hs_admin_token');
      localStorage.removeItem('hs_admin_user');
      if (window.location.pathname !== '/login') {
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

// Convenience methods
const api = {
  get:    (path)         => adminRequest('GET',    path),
  post:   (path, body)   => adminRequest('POST',   path, body),
  put:    (path, body)   => adminRequest('PUT',    path, body),
  delete: (path)         => adminRequest('DELETE', path),
  patch:  (path, body)   => adminRequest('PATCH',  path, body),
};

// ── Dashboard ──────────────────────────────────────────────
export const dashboardApi = {
  getStats:          () => api.get('/dashboard/stats'),
  getSalesGraph:     () => api.get('/dashboard/sales-graph'),
  getOrderStatus:    () => api.get('/dashboard/order-status'),
  getRecentOrders:   () => api.get('/dashboard/recent-orders'),
  getTopSelling:     () => api.get('/dashboard/top-selling'),
  getLowStock:       () => api.get('/dashboard/low-stock'),
  getLatestCustomers:() => api.get('/dashboard/latest-customers'),
  getActivities:     () => api.get('/dashboard/activities'),
};

// ── Products ───────────────────────────────────────────────
export const productsApi = {
  getAll:      (params = {}) => api.get('/products?' + new URLSearchParams(params)),
  getById:     (id)           => api.get(`/products/${id}`),
  create:      (data)         => api.post('/products', data),
  update:      (id, data)     => api.put(`/products/${id}`, data),
  delete:      (id)           => api.delete(`/products/${id}`),
  bulkAction:  (ids, action)  => api.post('/products/bulk', { ids, action }),
  addImage:    (id, imageData, altText, isPrimary) =>
    api.post(`/products/${id}/images`, { imageData, altText, isPrimary }),
  removeImage: (id, imageId)  => api.delete(`/products/${id}/images/${imageId}`),
};

// ── Master Data ────────────────────────────────────────────
export const masterDataApi = {
  getTypes:    ()                  => api.get('/master/types'),
  getItems:    (type, params = {}) => api.get(`/master/${type}?` + new URLSearchParams(params)),
  createItem:  (type, data)        => api.post(`/master/${type}`, data),
  updateItem:  (type, id, data)    => api.put(`/master/${type}/${id}`, data),
  deleteItem:  (type, id)          => api.delete(`/master/${type}/${id}`),
  toggleItem:  (type, id)          => api.put(`/master/${type}/${id}/toggle`, {}),
};

// ── CMS ────────────────────────────────────────────────────
export const cmsApi = {
  getAllSections:  ()              => api.get('/cms/sections'),
  getSection:     (key)           => api.get(`/cms/sections/${key}`),
  updateSection:  (key, data)     => api.put(`/cms/sections/${key}`, data),
  uploadMedia:    (key, payload)  => api.post(`/cms/sections/${key}/media`, payload),
  togglePublish:  (key, isActive) => api.put(`/cms/sections/${key}/publish`, { isActive }),
  deleteBlock:    (key, blockId)  => api.delete(`/cms/sections/${key}/blocks/${blockId}`),
};

// ── Orders ─────────────────────────────────────────────────
export const ordersApi = {
  getAll:         (params = {})   => api.get('/orders?' + new URLSearchParams(params)),
  getById:        (id)            => api.get(`/orders/${id}`),
  updateStatus:   (id, status, note) => api.put(`/orders/${id}/status`, { status, note }),
  updateTracking: (id, trackingNumber, carrier) =>
    api.put(`/orders/${id}/tracking`, { trackingNumber, carrier }),
  processRefund:  (id, amount)    => api.post(`/orders/${id}/refund`, { amount }),
  cancel:         (id, reason)    => api.put(`/orders/${id}/cancel`, { reason }),
  getInvoice:     (id)            => api.get(`/orders/${id}/invoice`),
};

// ── Customers ──────────────────────────────────────────────
export const customersApi = {
  getAll:       (params = {})         => api.get('/customers?' + new URLSearchParams(params)),
  getById:      (id)                  => api.get(`/customers/${id}`),
  setStatus:    (id, action, reason)  => api.put(`/customers/${id}/status`, { action, reason }),
  getAnalytics: (id)                  => api.get(`/customers/${id}/analytics`),
};

// ── Coupons ────────────────────────────────────────────────
export const couponsApi = {
  getAll:    (params = {}) => api.get('/coupons?' + new URLSearchParams(params)),
  getById:   (id)          => api.get(`/coupons/${id}`),
  create:    (data)        => api.post('/coupons', data),
  update:    (id, data)    => api.put(`/coupons/${id}`, data),
  delete:    (id)          => api.delete(`/coupons/${id}`),
  toggle:    (id)          => api.put(`/coupons/${id}/toggle`, {}),
  validate:  (code, orderAmount) => api.post('/coupons/validate', { code, orderAmount }),
};

// ── Reports ────────────────────────────────────────────────
export const reportsApi = {
  getRevenue:   (params = {}) => api.get('/reports/revenue?' + new URLSearchParams(params)),
  getSales:     (params = {}) => api.get('/reports/sales?' + new URLSearchParams(params)),
  getCustomers: (params = {}) => api.get('/reports/customers?' + new URLSearchParams(params)),
  getOrders:    (params = {}) => api.get('/reports/orders?' + new URLSearchParams(params)),
  getCoupons:   (params = {}) => api.get('/reports/coupons?' + new URLSearchParams(params)),
  export:       (type, params = {}) =>
    api.get(`/reports/export/${type}?` + new URLSearchParams(params)),
};

// ── Settings ───────────────────────────────────────────────
export const settingsApi = {
  getAll:        ()        => api.get('/settings'),
  updateStore:   (data)    => api.put('/settings/store', data),
  updateSmtp:    (data)    => api.put('/settings/smtp', data),
  updatePayment: (data)    => api.put('/settings/payment', data),
  updateShipping:(data)    => api.put('/settings/shipping', data),
  updateTax:     (data)    => api.put('/settings/tax', data),
  updateSeo:     (data)    => api.put('/settings/seo', data),
  updateContact: (data)    => api.put('/settings/contact', data),
  updatePolicies:(data)    => api.put('/settings/policies', data),
  updateSocial:  (data)    => api.put('/settings/social', data),
  updateIntegrations:(data)=> api.put('/settings/integrations', data),
  uploadLogo:    (imageData) => api.post('/settings/logo', { imageData }),
  uploadFavicon: (imageData) => api.post('/settings/favicon', { imageData }),
  // Admin users
  getAdmins:     ()        => api.get('/settings/admins'),
  createAdmin:   (data)    => api.post('/settings/admins', data),
  updateAdmin:   (id, data)=> api.put(`/settings/admins/${id}`, data),
  deleteAdmin:   (id)      => api.delete(`/settings/admins/${id}`),
  // Roles
  getRoles:      ()        => api.get('/settings/roles'),
  getPermissions:(roleId)  => api.get(`/settings/roles/${roleId}/permissions`),
  updatePerms:   (roleId, permissions) => api.put(`/settings/roles/${roleId}/permissions`, { permissions }),
};

// ── Shipping Methods ───────────────────────────────────────
export const shippingMethodsApi = {
  getAll:  ()         => api.get('/settings/shipping-methods'),
  create:  (data)     => api.post('/settings/shipping-methods', data),
  update:  (id, data) => api.put(`/settings/shipping-methods/${id}`, data),
  delete:  (id)       => api.delete(`/settings/shipping-methods/${id}`),
  toggle:  (id)       => api.put(`/settings/shipping-methods/${id}/toggle`, {}),
};

// ── Notifications ──────────────────────────────────────────
export const notificationsApi = {
  getAll:     (params = {}) => api.get('/notifications?' + new URLSearchParams(params)),
  markRead:   (id)          => api.put(`/notifications/${id}/read`, {}),
  markAllRead:()            => api.put('/notifications/read-all', {}),
  delete:     (id)          => api.delete(`/notifications/${id}`),
  checkStock: ()            => api.post('/notifications/check-stock', {}),
};

// ── Upload ─────────────────────────────────────────────────
export const uploadApi = {
  uploadImage:  (imageData, filename) => api.post('/upload/image', { imageData, filename }),
  uploadImages: (images)              => api.post('/upload/images', { images }),
};

// ── Email Logs ─────────────────────────────────────────────
export const emailLogsApi = {
  getLogs: () => api.get('/email-logs'),
};

// ── Reviews ────────────────────────────────────────────────
export const reviewsApi = {
  getReviews:   ()           => api.get('/reviews'),
  updateReview: (id, payload)=> api.put(`/reviews/${id}`, payload),
  deleteReview: (id)         => api.delete(`/reviews/${id}`),
};

// ── Saree Crown Campaign ───────────────────────────────────
export const sareeCrownApi = {
  list:         ()          => api.get('/saree-crown'),
  get:          (id)        => api.get(`/saree-crown/${id}`),
  create:       (data)      => api.post('/saree-crown', data),
  save:         (id, data)  => api.put(`/saree-crown/${id}`, data),
  stopVoting:   (id)        => api.post(`/saree-crown/${id}/stop-voting`),
  revealWinner: (id)        => api.post(`/saree-crown/${id}/reveal-winner`),
};

// ── Sellers Management ───────────────────────────────────────
export const sellersApi = {
  getRequests:  ()          => api.get('/sellers?status=pending'),
  getAll:       (params = {}) => api.get('/sellers?' + new URLSearchParams(params)),
  getById:      (id)        => api.get(`/sellers/${id}`),
  approve:      (id)        => api.post(`/sellers/${id}/approve`, {}),
  reject:       (id, data)  => api.post(`/sellers/${id}/reject`, data),
  suspend:      (id, data)  => api.post(`/sellers/${id}/suspend`, data),
  unsuspend:    (id)        => api.post(`/sellers/${id}/unsuspend`, {}),
  getProducts:  (id)        => api.get(`/sellers/${id}/products`),
  getOrders:    (id)        => api.get(`/sellers/${id}/orders`),
};

// ── Product Approvals ────────────────────────────────────────
export const productApprovalsApi = {
  getAll:       (params = {}) => api.get('/product-approvals?' + new URLSearchParams(params)),
  approve:      (id)        => api.post(`/product-approvals/${id}/approve`, {}),
  reject:       (id, reason)=> api.post(`/product-approvals/${id}/reject`, { reason }),
};


/**
 * Convert a File object to base64 data URL
 * @param {File} file
 * @returns {Promise<string>} data URL (data:image/jpeg;base64,...)
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export default api;
