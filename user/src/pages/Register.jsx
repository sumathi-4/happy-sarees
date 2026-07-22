import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import AuthBanner from '../auth/AuthBanner/AuthBanner';
import styles from './Register.module.css';

import { useAuth } from '../context/AuthContext';
import { PATHS } from '../routes/paths';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      alert('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please check and try again.');
      return;
    }
    if (!formData.agreeTerms) {
      alert('Please agree to the Terms & Conditions to proceed.');
      return;
    }
    register(formData);
    alert(`Account created successfully for ${formData.name}!`);
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
                <button type="submit" className={styles.submitBtn}>
                  Create Account
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
    </div>
  );
}

export default Register;
