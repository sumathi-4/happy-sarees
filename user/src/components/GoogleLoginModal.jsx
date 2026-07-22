import React, { useState } from 'react';
import { FiX, FiCheckCircle } from 'react-icons/fi';
import styles from './GoogleLoginModal.module.css';

function GoogleLoginModal({ isOpen, onClose, onGoogleSignIn, isLoading }) {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);

  if (!isOpen) return null;

  const presetAccounts = [
    { name: 'Sumathi Saraswathi', email: 'sumathisaraswathi4@gmail.com', avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c' },
    { name: 'Happy Sarees User', email: 'user@happysarees.com', avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c' }
  ];

  const handleSelectAccount = (acc) => {
    setSelectedAccount(acc.email);
    onGoogleSignIn({
      email: acc.email,
      name: acc.name,
      picture: acc.avatar
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail) return;
    const nameToUse = googleName || googleEmail.split('@')[0];
    onGoogleSignIn({
      email: googleEmail,
      name: nameToUse,
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.googleBrand}>
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        <p className={styles.subtext}>Choose an account to continue to <strong>Happy Sarees</strong></p>

        {/* Account Selector */}
        <div className={styles.accountList}>
          {presetAccounts.map((acc, idx) => (
            <div
              key={idx}
              className={`${styles.accountItem} ${selectedAccount === acc.email ? styles.activeAccount : ''}`}
              onClick={() => handleSelectAccount(acc)}
            >
              <div className={styles.avatarCircle}>
                {acc.name.charAt(0)}
              </div>
              <div className={styles.accountDetails}>
                <span className={styles.accountName}>{acc.name}</span>
                <span className={styles.accountEmail}>{acc.email}</span>
              </div>
              {selectedAccount === acc.email && <FiCheckCircle className={styles.checkIcon} />}
            </div>
          ))}
        </div>

        <div className={styles.divider}>
          <span>or enter another Google account</span>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleCustomSubmit} className={styles.customForm}>
          <input
            type="email"
            required
            placeholder="enter.your.email@gmail.com"
            value={googleEmail}
            onChange={(e) => setGoogleEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Your Name (Optional)"
            value={googleName}
            onChange={(e) => setGoogleName(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.continueBtn} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </form>

        <p className={styles.disclaimer}>
          To continue, Google will share your name, email address, and profile picture with Happy Sarees.
        </p>
      </div>
    </div>
  );
}

export default GoogleLoginModal;
