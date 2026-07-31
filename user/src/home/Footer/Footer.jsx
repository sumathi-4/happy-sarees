import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import styles from './Footer.module.css';
const logoImg = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';

function Footer() {
  const { storeSettings } = useStoreSettings();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand/About block */}
        <div className={styles.brandBlock}>
          <div className={styles.logoContainer}>
            {storeSettings.logoData ? (
              <img src={storeSettings.logoData} alt={storeSettings.storeName} className={styles.logoImg} />
            ) : (
              <img src={logoImg} alt={storeSettings.storeName} className={styles.logoImg} />
            )}
          </div>
          <p className={styles.brandDesc}>
            {storeSettings.tagline || 'Your premium destination for handloomed elegance, bridal magnificence, and contemporary saree silhouettes.'}
          </p>
          <div className={styles.socials}>
            {storeSettings.instagram && (
              <a href={storeSettings.instagram} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Instagram">
                <FiInstagram />
              </a>
            )}
            {storeSettings.facebook && (
              <a href={storeSettings.facebook} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Facebook">
                <FiFacebook />
              </a>
            )}
            {storeSettings.twitter && (
              <a href={storeSettings.twitter} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Twitter">
                <FiTwitter />
              </a>
            )}
            {storeSettings.youtube && (
              <a href={storeSettings.youtube} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Youtube">
                <FiYoutube />
              </a>
            )}
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
            © {new Date().getFullYear()} {storeSettings.businessName || 'Happy Sarees Private Limited'}. All Rights Reserved.
          </p>
          <div className={styles.payments}>
            <span className={styles.paymentBadge}>VISA</span>
            <span className={styles.paymentBadge}>MASTERCARD</span>
            <span className={styles.paymentBadge}>UPI</span>
            {storeSettings.codEnabled && <span className={styles.paymentBadge}>COD</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
