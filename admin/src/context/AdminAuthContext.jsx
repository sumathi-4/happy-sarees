import React, { createContext, useContext, useState, useCallback } from 'react';

// ============================================================
//  AdminAuthContext — Connects to real Admin Backend API
//  API Base: http://localhost:5001/api/admin
//  Falls back gracefully if backend is unavailable
// ============================================================

const AdminAuthContext = createContext();

const API_BASE = 'http://localhost:5001/api/admin';

/** Helper: POST/GET with admin JWT header */
async function adminFetch(path, options = {}) {
  const token = localStorage.getItem('hs_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function AdminAuthProvider({ children }) {
  // Restore from localStorage on initial load
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hs_admin_user')); } catch { return null; }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    !!localStorage.getItem('hs_admin_token')
  );

  // ── Login ─────────────────────────────────────────────────
  const adminLogin = useCallback(async (email, password) => {
    try {
      const data = await adminFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        const { accessToken, refreshToken, admin } = data;

        // Persist tokens and user
        localStorage.setItem('hs_admin_token', accessToken);
        localStorage.setItem('hs_admin_refresh', refreshToken);
        localStorage.setItem('hs_admin_user', JSON.stringify(admin));

        setAdminUser(admin);
        setIsAdminAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error('[AdminLogin]', err.message);

      // ── FALLBACK: If backend unreachable, allow hardcoded demo login ──
      if (
        email.toLowerCase() === 'admin@happysarees.com' &&
        password === 'Admin@2026'
      ) {
        const demoUser = {
          id: 1,
          name: 'Super Admin',
          email: 'admin@happysarees.com',
          role: 'Super Admin',
          roleId: 1,
        };
        localStorage.setItem('hs_admin_user', JSON.stringify(demoUser));
        // No real token — frontend-only session
        localStorage.setItem('hs_admin_token', 'demo_token');
        setAdminUser(demoUser);
        setIsAdminAuthenticated(true);
        return { success: true, demo: true };
      }

      return { success: false, message: err.message || 'Login failed. Check backend connection.' };
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────
  const adminLogout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('hs_admin_refresh');
      if (refreshToken && refreshToken !== 'demo_token') {
        await adminFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (err) {
      console.warn('[AdminLogout]', err.message);
    } finally {
      localStorage.removeItem('hs_admin_token');
      localStorage.removeItem('hs_admin_refresh');
      localStorage.removeItem('hs_admin_user');
      setAdminUser(null);
      setIsAdminAuthenticated(false);
    }
  }, []);

  // ── Token Refresh ─────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('hs_admin_refresh');
      if (!token || token === 'demo_token') return;
      const data = await adminFetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      });
      if (data.accessToken) {
        localStorage.setItem('hs_admin_token', data.accessToken);
      }
    } catch {
      // Refresh failed — logout
      adminLogout();
    }
  }, [adminLogout]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        setAdminUser,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        refreshToken,
        adminFetch, // expose for use in components
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
}

// Named export for use in other contexts/components
export { adminFetch };
