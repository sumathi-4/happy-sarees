import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

function Breadcrumb({ items = [] }) {
  return (
    <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <span className={styles.separator}>&gt;</span>}
            {isLast || !item.path ? (
              <span className={styles.activeCrumb}>{item.label}</span>
            ) : (
              <Link to={item.path} className={styles.crumbLink}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
