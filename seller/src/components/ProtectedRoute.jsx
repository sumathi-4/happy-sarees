import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';

function ProtectedRoute() {
  const { sellerUser, loading } = useSellerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: 'var(--bg-soft-pink)',
        fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--text-color)'
      }}>
        Authenticating seller studio session...
      </div>
    );
  }

  if (!sellerUser) {
    // Save current location to redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if pending/rejected/suspended
  if (sellerUser.status !== 'approved') {
    return <Navigate to={`/status/${sellerUser.status}`} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
