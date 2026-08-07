import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../context/SellerAuthContext';
import { FiClock, FiAlertTriangle, FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import styles from '../styles/Register.module.css';

const LOGO_URL = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';

function StatusPage() {
  const { status } = useParams();
  const { sellerUser, refreshUserStatus, logout } = useSellerAuth();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in, pull status
    if (sellerUser && sellerUser.status === 'approved') {
      navigate('/dashboard');
    }
  }, [sellerUser, navigate]);

  const handleCheckStatus = async () => {
    setChecking(true);
    const updatedUser = await refreshUserStatus();
    setChecking(false);
    if (updatedUser && updatedUser.status === 'approved') {
      navigate('/dashboard');
    }
  };

  const handleBackToLogin = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className={styles.successScreen}>
            <FiClock style={{ fontSize: '64px', color: 'var(--gold-color)', marginBottom: '12px' }} />
            <h2 className={styles.successTitle}>Application Pending Review</h2>
            <p className={styles.successDesc}>
              Hello {sellerUser?.ownerName || 'Weaver Partner'}, your shop registration for <strong>"{sellerUser?.storeName || 'Your Store'}"</strong> is currently pending review by our compliance team. We are checking your PAN card and bank account details.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button className={styles.btnSecondary} onClick={handleBackToLogin}>
                <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Login
              </button>
              <button className={styles.btnPrimary} onClick={handleCheckStatus} disabled={checking}>
                <FiRefreshCw className={checking ? 'spin' : ''} style={{ marginRight: '6px' }} /> {checking ? 'Checking...' : 'Check Again'}
              </button>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className={styles.successScreen}>
            <FiXCircle style={{ fontSize: '64px', color: 'var(--error-color)', marginBottom: '12px' }} />
            <h2 className={styles.successTitle} style={{ color: 'var(--error-color)' }}>Application Rejected</h2>
            <p className={styles.successDesc}>
              We regret to inform you that your seller application for <strong>"{sellerUser?.storeName}"</strong> was not accepted at this time.
            </p>
            {sellerUser?.rejectionReason && (
              <div style={{ 
                background: 'var(--error-bg)', 
                color: 'var(--error-color)', 
                padding: '16px 20px', 
                borderRadius: 'var(--radius-input)', 
                border: '1.5px solid var(--error-color)',
                marginTop: '16px',
                textAlign: 'left',
                width: '100%',
                fontSize: '13px'
              }}>
                <strong>Rejection Reason:</strong> {sellerUser.rejectionReason}
              </div>
            )}
            <p className={styles.successDesc} style={{ fontSize: '12px', marginTop: '16px' }}>
              You may contact support at partner-support@happysarees.com for questions or to re-apply.
            </p>
            <button className={styles.btnSecondary} onClick={handleBackToLogin} style={{ marginTop: '24px' }}>
              Return to Login
            </button>
          </div>
        );

      case 'suspended':
        return (
          <div className={styles.successScreen}>
            <FiAlertTriangle style={{ fontSize: '64px', color: 'var(--warning-color)', marginBottom: '12px' }} />
            <h2 className={styles.successTitle} style={{ color: 'var(--warning-color)' }}>Account Suspended</h2>
            <p className={styles.successDesc}>
              Access to the seller studio for <strong>"{sellerUser?.storeName}"</strong> has been suspended due to policy violations. All your product listings are currently hidden from public display.
            </p>
            <p className={styles.successDesc} style={{ fontSize: '13px', marginTop: '12px' }}>
              Please check your business email inbox for warnings/guidance, or appeal the suspension by writing to compliance@happysarees.com.
            </p>
            <button className={styles.btnSecondary} onClick={handleBackToLogin} style={{ marginTop: '24px' }}>
              Return to Login
            </button>
          </div>
        );

      default:
        return (
          <div className={styles.successScreen}>
            <h2 className={styles.successTitle}>Invalid Status</h2>
            <button className={styles.btnSecondary} onClick={handleBackToLogin} style={{ marginTop: '24px' }}>
              Return to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={LOGO_URL} alt="Happy Sarees" className={styles.logo} />
          <h2 className={styles.title}>Atelier Status</h2>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default StatusPage;
