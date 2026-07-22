import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import styles from './Footer.module.css';
import logoImg from '../../assets/logo.jpg';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand/About block */}
        <div className={styles.brandBlock}>
          <div className={styles.logoContainer}>
            <img src={logoImg} alt="Happy Sarees" className={styles.logoImg} />
          </div>
          <p className={styles.brandDesc}>
            Your premium destination for handloomed elegance, bridal magnificence, and contemporary saree silhouettes.
          </p>
          <div className={styles.socials}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Youtube">
              <FiYoutube />
            </a>
          </div>
        </div>

        {/* Column 1 - Company */}
        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Company</h4>
          <ul className={styles.linkList}>
            <li><Link to={PATHS.ABOUT}>About Us</Link></li>
            <li><Link to={PATHS.CONTACT}>Careers</Link></li>
            <li><Link to={PATHS.CONTACT}>Our Boutiques</Link></li>
            <li><Link to={PATHS.CONTACT}>Press & Media</Link></li>
          </ul>
        </div>

        {/* Column 2 - Collections */}
        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Collections</h4>
          <ul className={styles.linkList}>
            <li><Link to={PATHS.SHOP}>Silk Sarees</Link></li>
            <li><Link to={PATHS.COLLECTIONS}>Wedding Royal</Link></li>
            <li><Link to={PATHS.NEW_ARRIVALS}>New Arrivals</Link></li>
            <li><Link to={PATHS.SHOP}>Organza Drapes</Link></li>
          </ul>
        </div>

        {/* Column 3 - Policies */}
        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Policies</h4>
          <ul className={styles.linkList}>
            <li><Link to={PATHS.HOME}>Privacy Policy</Link></li>
            <li><Link to={PATHS.HOME}>Terms & Conditions</Link></li>
            <li><Link to={PATHS.HOME}>Shipping & Delivery</Link></li>
            <li><Link to={PATHS.HOME}>Returns & Refunds</Link></li>
          </ul>
        </div>

        {/* Column 4 - Support */}
        <div className={styles.linkColumn}>
          <h4 className={styles.columnTitle}>Support</h4>
          <ul className={styles.linkList}>
            <li><Link to={PATHS.CONTACT}>Customer Support</Link></li>
            <li><Link to={PATHS.CONTACT}>Track Your Order</Link></li>
            <li><Link to={PATHS.CONTACT}>Draping Masterclass</Link></li>
            <li><Link to={PATHS.CONTACT}>FAQs</Link></li>
          </ul>
        </div>
      </div>

      {/* Footer Copyright and Payments */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Happy Sarees Private Limited. All Rights Reserved.
          </p>
          <div className={styles.payments}>
            <span className={styles.paymentBadge}>VISA</span>
            <span className={styles.paymentBadge}>MASTERCARD</span>
            <span className={styles.paymentBadge}>UPI</span>
            <span className={styles.paymentBadge}>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
