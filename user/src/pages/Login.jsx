import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import AuthBanner from '../auth/AuthBanner/AuthBanner';
import styles from './Login.module.css';

import { useAuth } from '../context/AuthContext';
import { PATHS } from '../routes/paths';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in your Email Address and Password.');
      return;
    }
    login(email, password);
    alert(`Welcome back! Logged in as ${email}`);
    navigate(PATHS.PROFILE);
  };

  const handleGoogleLogin = () => {
    alert('Google login initialized.');
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
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
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
                <button type="submit" className={styles.submitBtn}>
                  Login
                </button>

                {/* Divider */}
                <div className={styles.dividerRow}>
                  <span className={styles.dividerLine}></span>
                  <span className={styles.dividerText}>or continue with</span>
                  <span className={styles.dividerLine}></span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={styles.googleBtn}
                >
                  <svg className={styles.googleIcon} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Continue with Google
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
    </div>
  );
}

export default Login;
