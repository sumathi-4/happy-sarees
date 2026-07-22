import React, { useState } from 'react';
import styles from './Newsletter.module.css';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <span className={styles.tagline}>JOIN THE SISTERHOOD</span>
        <h2 className={styles.title}>Subscribe to our Newsletter</h2>
        <p className={styles.desc}>
          Sign up to receive early access to new designer collection drops, festival offers, and exclusive draping tips directly in your inbox.
        </p>

        {subscribed ? (
          <div className={styles.successMessage}>
            <p>🌸 Thank you for subscribing! We will keep you updated.</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Enter your luxury email address..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.submitBtn}>
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default Newsletter;
