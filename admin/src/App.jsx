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
            path: '/homepage',
            element: <HomepageCMS />,
          },
          {
            path: '/orders',
            element: <PlaceholderPage />,
          },
          {
            path: '/customers',
            element: <PlaceholderPage />,
          },
          {
            path: '/coupons',
            element: <PlaceholderPage />,
          },
          {
            path: '/reports',
            element: <PlaceholderPage />,
          },
          {
            path: '/settings',
            element: <PlaceholderPage />,
          },
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
