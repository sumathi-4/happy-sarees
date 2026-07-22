import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('hs_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!adminUser);

  const adminLogin = async (email, password) => {
    if (email.toLowerCase() === 'admin@happysarees.com' && password === 'admin123') {
      const user = {
        name: 'Admin',
        email: 'admin@happysarees.com',
        role: 'Super Admin',
        avatar: '/src/assets/hero_saree_model.png' // fallback avatar
      };
      setAdminUser(user);
      setIsAdminAuthenticated(true);
      localStorage.setItem('hs_admin_user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: 'Invalid Admin Email or Password' };
  };

  const adminLogout = () => {
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('hs_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated,
        adminLogin,
        adminLogout
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
