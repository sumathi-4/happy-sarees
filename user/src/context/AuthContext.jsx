import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEFAULT_MOCK_USER = {
  name: "Sumathi",
  email: "sumathi@happysarees.com",
  phone: "+91 98765 43210",
  memberTier: "Premium Member",
  rewardPoints: 1520,
  pendingOrdersCount: 3,
  deliveredOrdersCount: 18,
  wishlistCount: 12,
  addressCount: 2,
  totalOrders: 21,
  totalSpent: 45296,
  totalSaved: 6250,
  memberSince: "May 2024",
  avatar: null
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hs_user') || localStorage.getItem('happy_sarees_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Verify JWT session on mount
  useEffect(() => {
    const token = localStorage.getItem('hs_token');
    if (token) {
      api.getProfile()
        .then((data) => {
          if (data.success && data.user) {
            const fullUser = { ...DEFAULT_MOCK_USER, ...data.user };
            setUser(fullUser);
            localStorage.setItem('hs_user', JSON.stringify(fullUser));
          }
        })
        .catch((err) => {
          console.log('[AuthContext] Session invalid or expired:', err.message);
          localStorage.removeItem('hs_token');
          localStorage.removeItem('hs_user');
          setUser(null);
        });
    }
  }, []);

  const isAuthenticated = !!user;

  // ── Login ───────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      if (data.success && data.token) {
        localStorage.setItem('hs_token', data.token);
        const loggedInUser = { ...DEFAULT_MOCK_USER, ...data.user };
        setUser(loggedInUser);
        localStorage.setItem('hs_user', JSON.stringify(loggedInUser));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed.' };
    } catch (err) {
      console.error('[AuthContext.login error]', err.message);
      return { success: false, message: err.message || 'Invalid email or password.' };
    }
  };

  // ── Register ────────────────────────────────────────────
  const register = async (userData) => {
    try {
      const data = await api.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      });
      if (data.success && data.token) {
        localStorage.setItem('hs_token', data.token);
        const newUser = { ...DEFAULT_MOCK_USER, ...data.user };
        setUser(newUser);
        localStorage.setItem('hs_user', JSON.stringify(newUser));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed.' };
    } catch (err) {
      console.error('[AuthContext.register error]', err.message);
      return { success: false, message: err.message || 'Registration failed.' };
    }
  };

  // ── Google Login ────────────────────────────────────────
  const googleLogin = async (googleData) => {
    try {
      const data = await api.googleLogin(googleData);
      if (data.success && data.token) {
        localStorage.setItem('hs_token', data.token);
        const googleUser = { ...DEFAULT_MOCK_USER, ...data.user };
        setUser(googleUser);
        localStorage.setItem('hs_user', JSON.stringify(googleUser));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Google Sign-In failed.' };
    } catch (err) {
      console.error('[AuthContext.googleLogin error]', err.message);
      return { success: false, message: err.message || 'Google Sign-In failed.' };
    }
  };

  // ── Logout ──────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    localStorage.removeItem('happy_sarees_user');
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return { success: false, message: 'User not logged in' };
    try {
      const data = await api.updateProfile(updatedFields);
      if (data.success && data.user) {
        const updated = { ...user, ...data.user };
        setUser(updated);
        localStorage.setItem('hs_user', JSON.stringify(updated));
        return { success: true, message: data.message, user: updated };
      }
      // Local fallback if unauthenticated demo session
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('hs_user', JSON.stringify(updated));
      return { success: true, message: 'Profile updated locally', user: updated };
    } catch (err) {
      console.error('[AuthContext.updateProfile error]', err.message);
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('hs_user', JSON.stringify(updated));
      return { success: true, message: 'Profile updated', user: updated };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        googleLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      login: async () => ({ success: false, message: 'Auth context unavailable.' }),
      register: async () => ({ success: false, message: 'Auth context unavailable.' }),
      googleLogin: async () => ({ success: false, message: 'Auth context unavailable.' }),
      logout: () => {},
      updateProfile: () => {}
    };
  }
  return context;
}
