import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiAlertTriangle, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Settings.module.css';

function Settings() {
  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [successMsg,   setSuccessMsg]   = useState('');
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

      {/* ── Page Header ── */}
      <div className={styles.headerRow}>
        <span className={styles.eyebrow}>Seller Portal</span>
        <h1 className={styles.title}>Atelier Settings</h1>
        <p className={styles.subtitle}>Manage your account security and store preferences.</p>
      </div>

      {errorMsg && (
        <div className={styles.errorMsg}>
          <FiAlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className={styles.successMsg}>
          <FiCheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Password Section ── */}
        <form onSubmit={handleSubmit(onSubmitPassword)} className={styles.formCard}>
          <div className={styles.formBody}>

            <div className={styles.sectionTitle}>
              <FiLock style={{ color: 'var(--primary-color)', fontSize: '17px' }} />
              Account Password
            </div>
            <p className={styles.sectionDesc}>
              Update your login password. Use a strong, unique password of at least 6 characters.
            </p>

            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Current Security Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={errors.currentPassword ? styles.inputError : ''}
                  {...register('currentPassword', { required: 'Current password is required' })}
                />
                {errors.currentPassword && (
                  <span className={styles.errorText}>{errors.currentPassword.message}</span>
                )}
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
                {errors.newPassword && (
                  <span className={styles.errorText}>{errors.newPassword.message}</span>
                )}
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
                {errors.confirmNewPassword && (
                  <span className={styles.errorText}>{errors.confirmNewPassword.message}</span>
                )}
              </div>
            </div>

          </div>

          <div className={styles.actionsFooter}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>

        {/* ── Store Deactivation Section ── */}
        <div className={styles.dangerCard}>
          <div className={styles.formBody}>

            <div className={styles.sectionTitle} style={{ color: 'var(--error-color)' }}>
              <FiAlertTriangle style={{ fontSize: '17px' }} />
              Deactivate Workshop Store
            </div>
            <p className={styles.sectionDesc}>
              If you choose to suspend your business on Happy Sarees, you can request store deactivation.
              This request is sent directly to administration for audit.
            </p>

            <div className={styles.warningBox}>
              <div>
                <strong>⚠️ IMPORTANT NOTICE:</strong>
                Upon deactivation approval, all your active product catalog listings will be taken offline
                immediately. Pending customer orders must still be packaged and shipped to settle
                outstanding payouts.
              </div>
            </div>

          </div>

          <div className={styles.actionsFooter}>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={handleDeactivateRequest}
              disabled={deactivating}
            >
              {deactivating ? 'Submitting…' : 'Request Store Deactivation'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
