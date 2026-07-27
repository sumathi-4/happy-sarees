import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Fetch cart items from Neon DB backend API
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getCart();
      if (res && res.success && Array.isArray(res.cart)) {
        setCart(res.cart);
      } else if (res && Array.isArray(res)) {
        setCart(res);
      }
    } catch (err) {
      console.warn('[CartContext] Cart fetch warning:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Item to Cart (Neon DB API Sync)
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!isAuthenticated) {
      showToast('Please log in to add items to your shopping cart', 'info');
      window.location.href = '/login';
      return;
    }

    if (!product) return;
    const prodId = product.id || product.productId;
    if (!prodId) return;

    try {
      // Optimistic update
      setCart(prev => {
        const existingIndex = prev.findIndex(item => Number(item.id) === Number(prodId) || Number(item.productId) === Number(prodId));
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + quantity
          };
          return updated;
        } else {
          const newItem = {
            id: Number(prodId),
            productId: Number(prodId),
            name: product.name || 'Silk Saree',
            slug: product.slug || '',
            price: Number(product.price || 0),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
            fabric: product.fabric || '',
            quantity: quantity
          };
          return [newItem, ...prev];
        }
      });

      await api.addToCart(prodId, quantity);
      showToast(`Added "${product.name || 'Saree'}" to your shopping bag! 🛍️`, 'success');
    } catch (err) {
      console.error('[CartContext] Add to cart error:', err.message);
      showToast('Failed to add item to cart. Please try again.', 'error');
      fetchCart();
    }
  }, [isAuthenticated, showToast, fetchCart]);

  // Remove Item from Cart
  const removeFromCart = useCallback(async (productId) => {
    if (!productId) return;
    try {
      setCart(prev => prev.filter(item => Number(item.id) !== Number(productId) && Number(item.productId) !== Number(productId)));
      await api.removeFromCart(productId);
      showToast('Item removed from cart', 'info');
    } catch (err) {
      console.error('[CartContext] Remove error:', err.message);
      fetchCart();
    }
  }, [showToast, fetchCart]);

  // Update Item Quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (!productId || newQuantity < 1) return;
    try {
      setCart(prev => prev.map(item => {
        if (Number(item.id) === Number(productId) || Number(item.productId) === Number(productId)) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }));
      await api.addToCart(productId, newQuantity);
    } catch (err) {
      console.error('[CartContext] Update quantity error:', err.message);
      fetchCart();
    }
  }, [fetchCart]);

  // Total Quantity Count
  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Total Amount Subtotal
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartTotal,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      refetchCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
