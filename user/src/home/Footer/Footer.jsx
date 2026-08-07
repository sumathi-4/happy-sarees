import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import styles from './Footer.module.css';

const logoImg = '/logo.png';

function Footer() {
  const { storeSettings } = useStoreSettings();

  // Dynamic link list for CUSTOMER section — only display existing routes in PATHS
  const customerLinks = [
    { label: 'My Account', path: PATHS.PROFILE },
    { label: 'My Orders', path: PATHS.PROFILE ? `${PATHS.PROFILE}?tab=orders` : null },
    { label: 'Wishlist', path: PATHS.WISHLIST },
    { label: 'Cart', path: PATHS.CART }
  ].filter(link => Boolean(link.path));

  // Dynamic link list for QUICK LINKS section — only display existing routes in PATHS
  const quickLinks = [
    { label: 'Home', path: PATHS.HOME },
    { label: 'Sarees', path: PATHS.SHOP },
    { label: 'Occasions', path: PATHS.SHOP ? `${PATHS.SHOP}?tab=occasions` : null },
    { label: 'Fabrics', path: PATHS.SHOP ? `${PATHS.SHOP}?tab=fabrics` : null },
    { label: 'New Arrivals', path: PATHS.NEW_ARRIVALS },
    { label: 'Sale', path: PATHS.SALE }
  ].filter(link => Boolean(link.path));

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand / About block */}
        <div className={styles.brandBlock}>
          <div className={styles.logoContainer}>
            {storeSettings.logoData ? (
              <img src={storeSettings.logoData} alt={storeSettings.storeName || 'Happy Sarees'} className={styles.logoImg} />
            ) : (
              <img src={logoImg} alt={storeSettings.storeName || 'Happy Sarees'} className={styles.logoImg} />
            )}
          </div>
          <p className={styles.brandDesc}>
            {storeSettings.tagline || 'Celebrate Every Tradition with our handloomed luxury saree collections.'}
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

        {/* CUSTOMER Section */}
        {customerLinks.length > 0 && (
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>CUSTOMER</h4>
            <ul className={styles.linkList}>
              {customerLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* QUICK LINKS Section */}
        {quickLinks.length > 0 && (
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>QUICK LINKS</h4>
            <ul className={styles.linkList}>
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Bottom — Copyright and Payments (RAZORPAY & COD) */}
      <div className={styles.footerBottom}>
        <div className={styles.bottomContainer}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {storeSettings.businessName || 'Happy Sarees Private Limited'}. All Rights Reserved.
          </p>
          <div className={styles.payments}>
            <span className={styles.paymentBadge}>RAZORPAY</span>
            <span className={styles.paymentBadge}>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
