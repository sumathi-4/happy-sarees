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
  avatar: "/src/assets/hero_saree_model.png"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hs_user') || localStorage.getItem('happy_sarees_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_MOCK_USER;
      }
    }
    return DEFAULT_MOCK_USER;
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
        .catch(() => {
          console.log('[AuthContext] Session offline or expired.');
        });
    }
  }, []);

  const isAuthenticated = !!user;

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
    } catch (err) {
      // Fallback local login if backend is unreachable
      const loggedInUser = {
        ...DEFAULT_MOCK_USER,
        email: email || DEFAULT_MOCK_USER.email,
        name: email ? email.split('@')[0] : DEFAULT_MOCK_USER.name
      };
      setUser(loggedInUser);
      localStorage.setItem('hs_user', JSON.stringify(loggedInUser));
      return { success: true, message: 'LoggedIn (Offline Mode)' };
    }
  };

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
    } catch (err) {
      const newUser = {
        ...DEFAULT_MOCK_USER,
        name: userData.name || DEFAULT_MOCK_USER.name,
        email: userData.email || DEFAULT_MOCK_USER.email,
        phone: userData.phone || DEFAULT_MOCK_USER.phone
      };
      setUser(newUser);
      localStorage.setItem('hs_user', JSON.stringify(newUser));
      return { success: true, message: 'Registered (Offline Mode)' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    localStorage.removeItem('happy_sarees_user');
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('hs_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
