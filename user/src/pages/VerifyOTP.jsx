import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiArrowLeft, FiCheck } from 'react-icons/fi';
import styles from './VerifyOTP.module.css';

function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const targetEmail = localStorage.getItem('reset_email') || 'example@gmail.com';

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = () => {
    setTimer(45);
    setCanResend(false);
    alert(`A new 6-digit OTP has been sent to ${targetEmail}.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      alert('Please enter all 6 digits of the OTP.');
      return;
    }
    alert('OTP verified successfully!');
    navigate('/reset-password');
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        {/* Soft Pink Graphic Badge Icon */}
        <div className={styles.iconCircle}>
          <div className={styles.shieldGraphic}>
            <FiShield className={styles.shieldIcon} />
          </div>
        </div>

        <h1 className={styles.title}>Verify OTP</h1>
        <p className={styles.subtitle}>
          Enter the 6-digit code sent to <strong>{targetEmail}</strong>
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 6 OTP Boxes */}
          <div className={styles.otpGrid}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.otpBox}
                aria-label={`OTP Digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Countdown & Resend Row */}
          <div className={styles.resendRow}>
            {!canResend ? (
              <span className={styles.timerText}>
                Resend OTP in <strong>00:{timer < 10 ? `0${timer}` : timer}</strong>
              </span>
            ) : (
              <button type="button" onClick={handleResend} className={styles.resendBtn}>
                Resend OTP
              </button>
            )}
          </div>

          <button type="submit" className={styles.submitBtn}>
            Verify OTP <FiCheck />
          </button>
        </form>

        <Link to="/login" className={styles.backLink}>
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default VerifyOTP;
