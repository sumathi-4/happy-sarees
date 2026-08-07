import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { SellerAuthProvider } from './context/SellerAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SellerLayout from './layouts/SellerLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import StatusPage from './pages/StatusPage';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import MasterDataRequests from './pages/MasterDataRequests';
import Payouts from './pages/Payouts';

const router = createBrowserRouter([
  // Public Paths
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/status/:status',
    element: <StatusPage />,
  },
  
  // Protected Dashboard Paths
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />,
          },
          {
            path: '/products',
            element: <ProductList />,
          },
          {
            path: '/products/new',
            element: <ProductForm />,
          },
          {
            path: '/products/:id/edit',
            element: <ProductForm />,
          },
          {
            path: '/orders',
            element: <OrderList />,
          },
          {
            path: '/orders/:id',
            element: <OrderDetail />,
          },
          {
            path: '/analytics',
            element: <Analytics />,
          },
          {
            path: '/notifications',
            element: <Notifications />,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/settings',
            element: <Settings />,
          },
          {
            path: '/master-data-requests',
            element: <MasterDataRequests />,
          },
          {
            path: '/payouts',
            element: <Payouts />,
          }
        ]
      }
    ]
  },

  // Fallbacks
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return (
    <SellerAuthProvider>
      <RouterProvider router={router} />
    </SellerAuthProvider>
  );
}

export default App;
