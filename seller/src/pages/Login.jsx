import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';
import { useSellerAuth } from '../context/SellerAuthContext';
import styles from '../styles/Register.module.css'; // Reuses card forms layout styling

const LOGO_URL = '/logo.png';

function Login() {
  const { login } = useSellerAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        const { status } = res.seller;
        if (status === 'approved') {
          navigate('/dashboard');
        } else {
          navigate(`/status/${status}`);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '440px' }}>
        <div className={styles.header}>
          <img src={LOGO_URL} alt="Happy Sarees" className={styles.logo} />
          <h2 className={styles.title}>Seller Login</h2>
          <p className={styles.subtitle}>Sign in to manage your weaver workshop atelier.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.formBody}>
          {errorMsg && (
            <div className={styles.errorText} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px', color: 'var(--error-color)', marginBottom: '20px' }}>
              <FiAlertCircle /> {errorMsg}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className={errors.email ? styles.inputError : ''}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={errors.password ? styles.inputError : ''}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className={styles.loginPrompt} style={{ marginTop: '24px' }}>
            New weaver partner? <Link to="/register" className={styles.link}>Submit application</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
