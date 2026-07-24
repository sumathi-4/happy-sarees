import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const StoreSettingsContext = createContext();

export const DEFAULT_STORE_SETTINGS = {
  // 1. General
  storeName: 'Happy Sarees',
  tagline: 'Celebrate Every Tradition',
  logoData: '',
  faviconData: '',
  currency: 'INR',
  language: 'English',
  timezone: 'Asia/Kolkata (GMT +5:30)',
  dateFormat: 'DD MMM YYYY',
  timeFormat: '12 Hours (hh:mm AM/PM)',

  // 2. Contact & Business
  email: 'support@happysarees.com',
  phone: '+91 98765 43210',
  whatsapp: '+91 91234 56789',
  gst: '33ABCDE1234F1Z5',
  businessName: 'Happy Sarees Retail Pvt Ltd',
  businessAddress: '123, Silk Street, Anna Nagar,\nChennai, Tamil Nadu - 600040, India',
  workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',

  // 3. Tax
  enableGst: true,
  gstPercent: 5,
  taxInclusive: 'Tax Inclusive',

  // 4. Shipping
  enableFreeShipping: true,
  minFreeShippingOrder: 2999,
  standardShippingRate: 99,
  expressShippingRate: 199,
  deliveryDays: '3-5 Business Days',

  // 5. Policies
  returnPolicy: 'We accept returns within 7 days of delivery. Sarees must be unused, unwashed, and in original packaging with tags intact.',
  exchangePolicy: 'Exchanges are permitted within 7 days for size, color, or manufacturing defect. Contact support for hassle-free pickup.',
  refundPolicy: 'Refunds will be processed within 5-7 business days after returned item passes quality inspection.',
  cancellationPolicy: 'Orders can be cancelled before dispatch for 100% refund. Once dispatched, standard return policy applies.',

  // 6. SEO
  defaultMetaTitle: 'Happy Sarees – Authentic Handloom & Silk Sarees Collection',
  defaultMetaDescription: 'Shop premium Kanchipuram, Banarasi, Cotton, and Organza sarees online. Handcrafted traditions delivered worldwide.',
  defaultSocialImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',

  // 7. Social Media
  facebook: 'https://facebook.com/happysarees',
  instagram: 'https://instagram.com/happysarees',
  youtube: 'https://youtube.com/c/happysarees',
  whatsappLink: 'https://wa.me/919123456789',
  pinterest: 'https://pinterest.com/happysarees',
  twitter: 'https://x.com/happysarees',

  // 8. Integrations
  razorpayKey: 'rzp_live_XXXXXXXXXXXXXX',
  razorpayEnabled: true,
  codEnabled: true,
  codMaxAmount: 5000
};

export function StoreSettingsProvider({ children }) {
  const [storeSettings, setStoreSettings] = useState(DEFAULT_STORE_SETTINGS);

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const fetched = data.settings;
        const merged = { ...DEFAULT_STORE_SETTINGS };

        ['store_general', 'store_contact', 'store_tax', 'store_shipping', 'store_policies', 'store_seo', 'store_social', 'store_integrations', 'store_payment', 'store_smtp'].forEach(key => {
          if (fetched[key]) {
            try {
              const parsed = typeof fetched[key] === 'string' ? JSON.parse(fetched[key]) : fetched[key];
              Object.assign(merged, parsed);
            } catch (e) {
              console.error(`Error parsing store setting ${key}:`, e);
            }
          }
        });

        setStoreSettings(merged);
      }
    } catch (err) {
      console.warn('[StoreSettingsProvider] Fetch settings error:', err.message);
    }
  };

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ storeSettings, refreshStoreSettings: fetchStoreSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    return { storeSettings: DEFAULT_STORE_SETTINGS, refreshStoreSettings: () => {} };
  }
  return context;
}
