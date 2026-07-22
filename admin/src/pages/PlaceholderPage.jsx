import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiPackage, FiHome, FiShoppingBag, FiUsers, FiPercent, FiBarChart2, 
  FiSettings, FiCompass 
} from 'react-icons/fi';
import EmptyState from '../components/EmptyState';

function PlaceholderPage() {
  const location = useLocation();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path.includes('products')) {
      return {
        title: 'Products Inventory',
        desc: 'View, add, modify, and delete saree catalog records, manage pricing, and track availability.',
        icon: <FiPackage />
      };
    }
    if (path.includes('homepage')) {
      return {
        title: 'Homepage curation',
        desc: 'Edit slide banners, highlight occasions, arrange best-selling displays, and manage testimonials.',
        icon: <FiHome />
      };
    }
    if (path.includes('orders')) {
      return {
        title: 'Orders management',
        desc: 'Track user checkouts, print packaging receipts, dispatch shipments, and manage returns.',
        icon: <FiShoppingBag />
      };
    }
    if (path.includes('customers')) {
      return {
        title: 'Customer Directory',
        desc: 'Manage registered shopper accounts, review purchase history, and update profile statuses.',
        icon: <FiUsers />
      };
    }
    if (path.includes('coupons')) {
      return {
        title: 'Coupons & Discount Offers',
        desc: 'Configure promo codes, define percentage off deals, set expiry durations, and schedule sales Sprints.',
        icon: <FiPercent />
      };
    }
    if (path.includes('reports')) {
      return {
        title: 'Reports & Analytics',
        desc: 'Inspect revenue charts, download transaction ledger PDFs, and analyze fabric category volumes.',
        icon: <FiBarChart2 />
      };
    }
    if (path.includes('settings')) {
      return {
        title: 'Portal Settings',
        desc: 'Modify store variables, adjust helmet security parameters, configure admin profiles, and manage rate limiter blocks.',
        icon: <FiSettings />
      };
    }
    return {
      title: 'Portal Section',
      desc: 'This page represents a premium administrative console module under development.',
      icon: <FiCompass />
    };
  };

  const meta = getPageMeta();

  return (
    <div style={{ padding: '20px 0' }}>
      <EmptyState
        title={meta.title}
        description={meta.desc}
        icon={meta.icon}
      />
    </div>
  );
}

export default PlaceholderPage;
