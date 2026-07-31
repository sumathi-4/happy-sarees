import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import styles from './PasswordTab.module.css';

function PasswordTab() {
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPass.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass
      });
      setLoading(false);
      if (res && res.success) {
        alert(res.message || 'Password updated successfully! Please use your new password on next login.');
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        alert(res?.message || 'Failed to update password.');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';
      alert(msg);
    }
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <h2 className={styles.tabTitle}>Change Password</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formBlock}>
        <div className={styles.inputGroup}>
          <label>Current Password</label>
          <div className={styles.inputWrapper}>
            <FiLock className={styles.icon} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Enter current password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>New Password</label>
          <div className={styles.inputWrapper}>
            <FiLock className={styles.icon} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Enter new password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className={styles.eyeBtn}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Confirm New Password</label>
          <div className={styles.inputWrapper}>
            <FiLock className={styles.icon} />
            <input
              type={showPass ? 'text' : 'password'}
              required
              placeholder="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className={styles.inputField}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Update Password <FiCheck />
        </button>
      </form>
    </div>
  );
}

export default PasswordTab;
