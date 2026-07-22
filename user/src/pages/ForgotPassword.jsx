import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import styles from './ForgotPassword.module.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address.');
      return;
    }
    // Store email in session/state indicator for verify OTP
    localStorage.setItem('reset_email', email);
    navigate('/verify-otp');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {/* Soft Pink Graphic Badge Icon */}
        <div className={styles.iconCircle}>
          <div className={styles.envelopeGraphic}>
            <FiMail className={styles.envelopeIcon} />
          </div>
        </div>

        <h1 className={styles.title}>Forgot Password?</h1>
        <p className={styles.subtitle}>
          Enter your registered email address. We will send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="forgot-email">Email Address</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                id="forgot-email"
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Send OTP <FiSend />
          </button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
