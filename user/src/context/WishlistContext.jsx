import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const WishlistContext = createContext();

const LOCAL_WISHLIST_KEY = 'hs_guest_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_WISHLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Fetch wishlist from Neon DB backend API if authenticated
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const saved = localStorage.getItem(LOCAL_WISHLIST_KEY);
        setWishlist(saved ? JSON.parse(saved) : []);
      } catch (e) {}
      return;
    }

    try {
      const res = await api.getWishlist();
      if (res && res.success && Array.isArray(res.wishlist)) {
        setWishlist(res.wishlist);
      } else if (res && Array.isArray(res)) {
        setWishlist(res);
      }
    } catch (err) {
      console.warn('[WishlistContext] Live fetch warning:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Sync guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
      } catch (e) {}
    }
  }, [wishlist, isAuthenticated]);

  // Check if a product ID is in wishlist
  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    const numId = Number(productId);
    return wishlist.some(item => Number(item.id) === numId || Number(item.productId) === numId);
  }, [wishlist]);

  // Toggle wishlist state for a product
  const toggleWishlist = useCallback(async (product) => {
    if (!product) return;
    const prodId = product.id || product.productId;
    if (!prodId) return;

    const inList = isInWishlist(prodId);

    if (inList) {
      // Remove from wishlist
      setWishlist(prev => prev.filter(item => Number(item.id) !== Number(prodId) && Number(item.productId) !== Number(prodId)));
      showToast(`Removed "${product.name || 'Saree'}" from your wishlist`, 'info');
      if (isAuthenticated) {
        api.removeFromWishlist(prodId).catch(err => console.error('Wishlist remove API error:', err));
      }
    } else {
      // Add to wishlist
      const newItem = {
        id: Number(prodId),
        productId: Number(prodId),
        name: product.name || 'Silk Saree',
        slug: product.slug || '',
        price: Number(product.price || 0),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
        discountBadge: product.discountBadge || null,
        image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
        fabric: product.fabric || '',
        shortDescription: product.shortDescription || '',
        inStock: product.inStock ?? true
      };
      setWishlist(prev => [newItem, ...prev.filter(item => Number(item.id) !== Number(prodId))]);
      showToast(`Saved "${product.name || 'Saree'}" to your wishlist! ♥`, 'success');
      if (isAuthenticated) {
        api.addToWishlist(prodId).catch(err => console.error('Wishlist add API error:', err));
      }
    }
  }, [isAuthenticated, isInWishlist, showToast]);

  // Explicit remove
  const removeFromWishlist = useCallback(async (productId) => {
    if (!productId) return;
    setWishlist(prev => prev.filter(item => Number(item.id) !== Number(productId) && Number(item.productId) !== Number(productId)));
    showToast('Removed item from wishlist', 'info');
    if (isAuthenticated) {
      api.removeFromWishlist(productId).catch(err => console.error('Wishlist remove API error:', err));
    }
  }, [isAuthenticated, showToast]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      refetchWishlist: fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
