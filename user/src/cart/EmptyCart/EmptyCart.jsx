import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import styles from './EmptyCart.module.css';

function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div className={styles.emptyContainer}>
      <div className={styles.illustrationBox}>
        <div className={styles.iconCircle}>
          <FiShoppingBag className={styles.bagIcon} />
        </div>
      </div>

      <h3 className={styles.title}>Your Shopping Bag is Empty!</h3>
      <p className={styles.subtitle}>
        Looks like you haven't added any sarees to your shopping bag yet. Explore our luxury loomed collections and start shopping today.
      </p>

      <button onClick={() => navigate('/shop')} className={styles.shopBtn}>
        Explore Sarees Catalog
      </button>
    </div>
  );
}

export default EmptyCart;
