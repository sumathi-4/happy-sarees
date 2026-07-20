import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const DEFAULT_MOCK_USER = {
  name: "Sumathi",
  email: "sumathi@example.com",
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
    const saved = localStorage.getItem('happy_sarees_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_MOCK_USER;
      }
    }
    // Default logged in user for seamless testing
    return DEFAULT_MOCK_USER;
  });

  const isAuthenticated = !!user;

  const login = (email, password) => {
    const loggedInUser = {
      ...DEFAULT_MOCK_USER,
      email: email || DEFAULT_MOCK_USER.email,
      name: email ? email.split('@')[0] : DEFAULT_MOCK_USER.name
    };
    setUser(loggedInUser);
    localStorage.setItem('happy_sarees_user', JSON.stringify(loggedInUser));
    return true;
  };

  const register = (userData) => {
    const newUser = {
      ...DEFAULT_MOCK_USER,
      name: userData.name || DEFAULT_MOCK_USER.name,
      email: userData.email || DEFAULT_MOCK_USER.email,
      phone: userData.phone || DEFAULT_MOCK_USER.phone
    };
    setUser(newUser);
    localStorage.setItem('happy_sarees_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('happy_sarees_user');
  };

  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('happy_sarees_user', JSON.stringify(updated));
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
