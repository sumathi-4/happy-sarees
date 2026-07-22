import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
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
            element: <PlaceholderPage />,
          },
          {
            path: '/homepage',
            element: <PlaceholderPage />,
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
      <RouterProvider router={router} />
    </AdminAuthProvider>
  );
}

export default App;
