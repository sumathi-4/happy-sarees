import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import AuthBanner from '../auth/AuthBanner/AuthBanner';
import GoogleLoginModal from '../components/GoogleLoginModal';
import styles from './Register.module.css';

import { useAuth } from '../context/AuthContext';
import { PATHS } from '../routes/paths';

function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(''); // Clear error on change
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the Terms & Conditions to proceed.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'An account with this email address already exists.');
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
              image="/src/assets/wedding_saree.png"
              headline="Crafted Luxury For Unforgettable Moments"
            />
          </div>

          {/* Right Column: Register Card */}
          <div className={styles.rightCol}>
            <div className={styles.formCard}>
              <div className={styles.headerBlock}>
                <h1 className={styles.title}>Create Your Account ✨</h1>
                <p className={styles.subtitle}>Create an account to enjoy exclusive benefits</p>
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
                {/* Full Name */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-name">Full Name</label>
                  <div className={styles.inputWrapper}>
                    <FiUser className={styles.inputIcon} />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-phone">Mobile Number</label>
                  <div className={styles.inputWrapper}>
                    <FiPhone className={styles.inputIcon} />
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Enter your mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-email">Email Address</label>
                  <div className={styles.inputWrapper}>
                    <FiMail className={styles.inputIcon} />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-password">Password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
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

                {/* Confirm Password */}
                <div className={styles.inputGroup}>
                  <label htmlFor="reg-confirmPassword">Confirm Password</label>
                  <div className={styles.inputWrapper}>
                    <FiLock className={styles.inputIcon} />
                    <input
                      id="reg-confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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

                {/* Checkbox */}
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Conditions</a> and <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                </label>

                {/* Submit Button */}
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Footer Link */}
                <div className={styles.footerRow}>
                  <span>Already have an account?</span>{' '}
                  <Link to="/login" className={styles.switchLink}>
                    Login
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

export default Register;
