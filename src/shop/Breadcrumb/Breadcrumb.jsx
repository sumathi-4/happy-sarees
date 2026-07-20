import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import styles from './Breadcrumb.module.css';

function Breadcrumb({ categoryName = 'All Sarees' }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <div className={styles.container}>
        <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
        <FiChevronRight className={styles.separator} />
        <Link to={PATHS.SHOP} className={styles.crumbLink}>Shop</Link>
        <FiChevronRight className={styles.separator} />
        <span className={styles.activeCrumb}>{categoryName}</span>
      </div>
    </nav>
  );
}

export default Breadcrumb;
