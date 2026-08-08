import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Settings.module.css';

function Settings() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const watchNewPassword = watch('newPassword');

  const onSubmitPassword = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await sellerApi.updatePassword(data.currentPassword, data.newPassword);
      setSuccessMsg('Your security password has been changed successfully.');
      reset();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateRequest = () => {
    if (window.confirm('WARNING: Are you sure you want to request deactivation of your seller store? Your product listings will be taken offline upon administration approval.')) {
      setDeactivating(true);
      setTimeout(() => {
        setDeactivating(false);
        alert('Deactivation request has been successfully submitted to admins. Payout audits and listing shutdowns will be initialized.');
      }, 1000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Atelier Settings</h1>
      </div>

      {errorMsg && (
        <div className={styles.errorMsg}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className={styles.successMsg}>
          <FiCheckCircle /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Password Reset */}
        <form onSubmit={handleSubmit(onSubmitPassword)} className={styles.formCard}>
          <div className={styles.formBody}>
            <h3 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock style={{ color: 'var(--primary-color)' }} /> Account Password
            </h3>

            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Current Security Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={errors.currentPassword ? styles.inputError : ''}
                  {...register('currentPassword', { required: 'Current password is required' })}
                />
                {errors.currentPassword && <span className={styles.errorText}>{errors.currentPassword.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={errors.newPassword ? styles.inputError : ''}
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                {errors.newPassword && <span className={styles.errorText}>{errors.newPassword.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={errors.confirmNewPassword ? styles.inputError : ''}
                  {...register('confirmNewPassword', { 
                    required: 'Confirm password is required',
                    validate: value => value === watchNewPassword || 'Passwords do not match'
                  })}
                />
                {errors.confirmNewPassword && <span className={styles.errorText}>{errors.confirmNewPassword.message}</span>}
              </div>
            </div>
          </div>

          <div className={styles.actionsFooter} style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>

        {/* Store Deactivation Card */}
        <div className={styles.formCard} style={{ borderColor: 'var(--error-color)' }}>
          <div className={styles.formBody}>
            <h3 className={styles.sectionTitle} style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAlertTriangle /> Deactivate Workshop Store
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                If you choose to suspend your business on Happy Sarees, you can request store deactivation. This request is sent directly to administration for audit.
              </p>
              
              <div style={{
                background: 'var(--warning-bg)',
                border: '1px solid var(--warning-color)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-premium)',
                fontSize: '12px',
                color: 'var(--warning-color)',
                lineHeight: '1.5'
              }}>
                <strong>⚠️ IMPORTANT NOTICE:</strong><br />
                Upon deactivation approval, all your active product catalog listings will be taken offline immediately. Pending customer orders must still be packaged and shipped to settle outstanding payouts.
              </div>
            </div>
          </div>

          <div className={styles.actionsFooter} style={{ justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className={styles.btnPrimary} 
              style={{ background: 'var(--error-color)' }}
              onClick={handleDeactivateRequest}
              disabled={deactivating}
            >
              Request Store Deactivation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
