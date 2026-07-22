import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import styles from './ResetPassword.module.css';

function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak Password', color: '#e53935' };
    if (score <= 3) return { score: 65, label: 'Medium Strength', color: '#fb8c00' };
    return { score: 100, label: 'Strong Password', color: '#2e7d32' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    alert('Password updated successfully! Please login with your new password.');
    navigate('/login');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {/* Soft Pink Graphic Badge Icon */}
        <div className={styles.iconCircle}>
          <div className={styles.lockGraphic}>
            <FiLock className={styles.lockIcon} />
          </div>
        </div>

        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Create a new password for your account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* New Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="reset-newPass">New Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                id="reset-newPass"
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={styles.eyeBtn}
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Live Password Strength Indicator */}
            {newPassword && (
              <div className={styles.strengthWrapper}>
                <div className={styles.strengthBarBg}>
                  <div
                    className={styles.strengthBarFill}
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className={styles.strengthText} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label htmlFor="reset-confirmPass">Confirm Password</label>
            <div className={styles.inputWrapper}>
              <FiLock className={styles.inputIcon} />
              <input
                id="reset-confirmPass"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeBtn}
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Update Password <FiCheck />
          </button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
