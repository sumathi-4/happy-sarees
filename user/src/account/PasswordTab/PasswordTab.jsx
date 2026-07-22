import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import styles from './PasswordTab.module.css';

function PasswordTab() {
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      alert('New passwords do not match.');
      return;
    }
    alert('Password updated successfully!');
    setPasswords({ current: '', newPass: '', confirm: '' });
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
