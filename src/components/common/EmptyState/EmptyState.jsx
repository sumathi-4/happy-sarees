import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiPackage, FiSearch, FiStar } from 'react-icons/fi';
import Button from '../Button/Button';
import { PATHS } from '../../../routes/paths';
import styles from './EmptyState.module.css';

function EmptyState({
  type = 'cart',
  title,
  description,
  actionLabel = 'Explore Sarees',
  actionPath = PATHS.SHOP,
  onAction
}) {
  const getIcon = () => {
    switch (type) {
      case 'wishlist':
        return <FiHeart />;
      case 'orders':
        return <FiPackage />;
      case 'search':
        return <FiSearch />;
      case 'reviews':
        return <FiStar />;
      case 'cart':
      default:
        return <FiShoppingBag />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'wishlist':
        return 'Your Wishlist is Empty';
      case 'orders':
        return 'No Orders Placed Yet';
      case 'search':
        return 'No Matching Sarees Found';
      case 'reviews':
        return 'No Reviews Written Yet';
      case 'cart':
      default:
        return 'Your Shopping Bag is Empty';
    }
  };

  const getDefaultDesc = () => {
    switch (type) {
      case 'wishlist':
        return 'Save your favorite silk sarees to your wishlist and review them anytime.';
      case 'orders':
        return 'Looks like you haven\'t placed any saree orders yet. Start exploring our collections!';
      case 'search':
        return 'Try searching with different keywords like Banarasi, Silk, Organza, or Linen.';
      case 'reviews':
        return 'Share your experiences and review your purchased sarees to help fellow patrons.';
      case 'cart':
      default:
        return 'Discover our royal handcrafted silk sarees and add your favorites to your bag.';
    }
  };

  return (
    <div className={styles.emptyCard}>
      <div className={styles.iconCircle}>
        <div className={styles.iconInner}>{getIcon()}</div>
      </div>
      <h3 className={styles.title}>{title || getDefaultTitle()}</h3>
      <p className={styles.desc}>{description || getDefaultDesc()}</p>

      {actionLabel && (
        <div className={styles.actionWrapper}>
          {actionPath ? (
            <Link to={actionPath} style={{ textDecoration: 'none' }}>
              <Button variant="primary">{actionLabel}</Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
