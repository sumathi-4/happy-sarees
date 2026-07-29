import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import ProductForm from './pages/ProductForm';
import ProductPreview from './pages/ProductPreview';
import MasterDataManagement from './pages/MasterDataManagement';
import HomepageCMS from './pages/HomepageCMS';
import OrdersManagement from './pages/OrdersManagement';
import Customers from './pages/Customers';
import Coupons from './pages/Coupons';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
import RatingsReviewsManagement from './pages/RatingsReviewsManagement';
import PlaceholderPage from './pages/PlaceholderPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AdminLogin />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: '/dashboard',
            element: <AdminDashboard />,
          },
          {
            path: '/products',
            element: <ProductManagement />,
          },
          {
            path: '/products/add',
            element: <ProductForm />,
          },
          {
            path: '/products/edit/:id',
            element: <ProductForm />,
          },
          {
            path: '/products/preview/:id',
            element: <ProductPreview />,
          },
          {
            path: '/master-data',
            element: <MasterDataManagement />,
          },
          {
            path: '/ratings-reviews',
            element: <RatingsReviewsManagement />,
          },
          {
            path: '/homepage',
            element: <HomepageCMS />,
          },
          {
            path: '/orders',
            element: <OrdersManagement />,
          },
          {
            path: '/customers',
            element: <Customers />,
          },
          {
            path: '/coupons',
            element: <Coupons />,
          },
          {
            path: '/reports',
            element: <Reports />,
          },
          {
            path: '/reports/sales',
            element: <Reports />,
          },
          {
            path: '/reports/products',
            element: <Reports />,
          },
          {
            path: '/reports/customers',
            element: <Reports />,
          },
          {
            path: '/reports/orders',
            element: <Reports />,
          },
          { path: '/settings',              element: <Settings /> },
          { path: '/settings/general',      element: <Settings /> },
          { path: '/settings/contact',      element: <Settings /> },
          { path: '/settings/tax',          element: <Settings /> },
          { path: '/settings/shipping',     element: <Settings /> },
          { path: '/settings/policies',     element: <Settings /> },
          { path: '/settings/seo',          element: <Settings /> },
          { path: '/settings/social',       element: <Settings /> },
          { path: '/settings/integrations', element: <Settings /> },
          { path: '/settings/store',        element: <Settings /> },
          { path: '/admin/settings/store',  element: <Settings /> },
          { path: '/settings/profile',      element: <ProfileSettings /> },
          { path: '/admin/settings/profile',element: <ProfileSettings /> },
          { path: '/settings/website',       element: <Settings /> },
          { path: '/settings/payments',      element: <Settings /> },
          { path: '/settings/email',         element: <Settings /> },
          { path: '/settings/system',        element: <Settings /> },
          { path: '/settings/backup',        element: <Settings /> },
          { path: '/settings/admin',         element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return (
    <AdminAuthProvider>
      <AdminDataProvider>
        <RouterProvider router={router} />
      </AdminDataProvider>
    </AdminAuthProvider>
  );
}

export default App;
