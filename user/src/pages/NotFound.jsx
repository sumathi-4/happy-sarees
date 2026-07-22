import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiHeadphones } from 'react-icons/fi';
import Button from '../components/common/Button/Button';
import { PATHS } from '../routes/paths';
import styles from './NotFound.module.css';

function NotFound() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.codeBadge}>404</div>

        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.subtitle}>
          The drape you are looking for might have been moved, renamed, or is temporarily out of stock.
        </p>

        <div className={styles.actionsRow}>
          <Link to={PATHS.HOME} style={{ textDecoration: 'none' }}>
            <Button variant="primary" icon={<FiHome />}>
              Back to Home
            </Button>
          </Link>
          <Link to={PATHS.SHOP} style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon={<FiShoppingBag />}>
              Shop Collections
            </Button>
          </Link>
          <Link to={PATHS.CONTACT} style={{ textDecoration: 'none' }}>
            <Button variant="text" icon={<FiHeadphones />}>
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
