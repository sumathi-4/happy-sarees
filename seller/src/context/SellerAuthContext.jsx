import React, { createContext, useContext, useState, useEffect } from 'react';
import { sellerApi } from '../api/sellerApi';

const SellerAuthContext = createContext(null);

export function SellerAuthProvider({ children }) {
  const [sellerUser, setSellerUser] = useState(() => {
    const saved = localStorage.getItem('hs_seller_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('hs_seller_token');
      if (token) {
        try {
          const res = await sellerApi.getMe();
          if (res.success && res.seller) {
            setSellerUser(res.seller);
            localStorage.setItem('hs_seller_user', JSON.stringify(res.seller));
          }
        } catch (err) {
          console.error('Seller session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await sellerApi.login(email, password);
      if (res.success) {
        if (res.token) {
          localStorage.setItem('hs_seller_token', res.token);
        }
        setSellerUser(res.seller);
        localStorage.setItem('hs_seller_user', JSON.stringify(res.seller));
        setLoading(false);
        return res;
      }
      throw new Error(res.message || 'Login failed.');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('hs_seller_token');
    localStorage.removeItem('hs_seller_user');
    setSellerUser(null);
  }

  async function refreshUserStatus() {
    try {
      const res = await sellerApi.getMe();
      if (res.success && res.seller) {
        setSellerUser(res.seller);
        localStorage.setItem('hs_seller_user', JSON.stringify(res.seller));
        return res.seller;
      }
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
    return null;
  }

  return (
    <SellerAuthContext.Provider
      value={{
        sellerUser,
        loading,
        login,
        logout,
        refreshUserStatus
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);
  if (!context) {
    throw new Error('useSellerAuth must be used within a SellerAuthProvider');
  }
  return context;
}
