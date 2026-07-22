import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import AuthBanner from '../auth/AuthBanner/AuthBanner';
import GoogleLoginModal from '../components/GoogleLoginModal';
import styles from './Login.module.css';

import { useAuth } from '../context/AuthContext';
import { PATHS } from '../routes/paths';

function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in your Email Address and Password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
      return;
    }

    // Success -> redirect to Profile
    navigate(PATHS.PROFILE);
  };

  const handleGoogleSignIn = async (googleAccount) => {
    setLoading(true);
    const result = await googleLogin(googleAccount);
    setLoading(false);
    setIsGoogleModalOpen(false);

    if (!result.success) {
      setError(result.message || 'Google authentication failed.');
      return;
    }

    navigate(PATHS.PROFILE);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.splitGrid}>
          {/* Left Column: Lifestyle Banner */}
          <div className={styles.leftCol}>
            <AuthBanner
              image="/src/assets/hero_saree_model.png"
              headline="Timeless Sarees For Every You"
            />
          </div>

          {/* Right Column: Login Card */}
          <div className={styles.rightCol}>
            <div className={styles.formCard}>
              <div className={styles.headerBlock}>
                <h1 className={styles.title}>Welcome Back 💖</h1>
                <p className={styles.subtitle}>Login to continue to your account</p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '0.8rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '1.2rem',
                  fontWeight: '500'
                }}>
                  <FiAlertCircle style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Email Input */}
                <div className={styles.inputGroup}>
                  <label htmlFor="login-email">Email Address</label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className={styles.inputGroup}>
                  <label htmlFor="login-password">Password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeBtn}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className={styles.optionsRow}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkbox}
                    />
                    Remember Me
                  </label>
                  <Link to="/forgot-password" className={styles.forgotLink}>
                    Forgot Password?
                  </Link>
                </div>

                {/* Login CTA Button */}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                {/* Footer Switch Link */}
                <div className={styles.footerRow}>
                  <span>Don't have an account?</span>{' '}
                  <Link to="/register" className={styles.switchLink}>
                    Register
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Google Sign In Modal */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onGoogleSignIn={handleGoogleSignIn}
        isLoading={loading}
      />
    </div>
  );
}

export default Login;
