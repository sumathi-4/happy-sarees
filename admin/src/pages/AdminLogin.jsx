import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import styles from '../styles/AdminLogin.module.css';

const LOGO_URL = '/logo.png';

function AdminLogin() {
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@happysarees.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      try {
        const result = await adminLogin(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <img src={LOGO_URL} alt="Happy Sarees" className={styles.logo} />
          <h1 className={styles.heading}>Admin Portal</h1>
          <p className={styles.subtitle}>Welcome back! Please sign in to your account</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="admin@happysarees.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                disabled={isLoading}
              />
              <FiMail className={styles.inputIcon} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className={styles.optionsRow}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.checkbox}
                disabled={isLoading}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => alert('Please contact the head office system administrator to reset your password.')}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footerText}>© 2026 Happy Sarees. All rights reserved.</p>
      </div>
    </div>
  );
}

export default AdminLogin;
