import React, { useState, useEffect } from 'react';
import { FiHeart, FiEye, FiShoppingCart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { PRODUCTS } from '../../data/mockData';
import api from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import QuickViewModal from '../../shop/QuickViewModal/QuickViewModal';
import styles from './BestSellers.module.css';

function BestSellers() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bestsellerList, setBestsellerList] = useState([]);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    api.getBestsellers()
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.products)) {
          setBestsellerList(data.products);
        }
      })
      .catch((err) => {
        console.warn('[BestSellers] Live fetch warning:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  const featured = bestsellerList.find((p) => p.isFeaturedBestSeller) || bestsellerList[0];
  const others = bestsellerList.filter((p) => p.id !== (featured ? featured.id : null));

  if (!featured) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Loomed Perfection</span>
        <h2 className={styles.title}>Best Sellers</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.layoutContainer}>
        {/* Left Column - Featured Big Card */}
        <div className={styles.featuredColumn}>
          <div className={styles.featuredCard}>
            <div className={styles.featuredImageWrapper}>
              <img src={featured.image} alt={featured.name} className={styles.featuredImage} />
              
              <button 
                onClick={() => toggleWishlist(featured)}
                className={`${styles.wishlistBtn} ${isInWishlist(featured.id) ? styles.activeWishlist : ''}`}
                aria-label="Wishlist"
              >
                {isInWishlist(featured.id) ? (
                  <FaHeart className={styles.heartIcon} style={{ color: '#e91e63' }} />
                ) : (
                  <FiHeart className={styles.heartIcon} />
                )}
              </button>

              <span className={styles.bestsellerTag}>BEST SELLER</span>
            </div>
            
            <div className={styles.featuredContent}>
              <span className={styles.featuredFabric}>{featured.fabric}</span>
              <h3 className={styles.featuredName}>{featured.name}</h3>
              <p className={styles.featuredDesc}>
                Our most celebrated design of the season, crafted in pure zari borders and standard length draping. An editorial-grade saree loved by our brides.
              </p>
              
              <div className={styles.featuredFooter}>
                <div className={styles.priceGroup}>
                  <span className={styles.featuredPrice}>₹{featured.price.toLocaleString('en-IN')}</span>
                  {featured.originalPrice && (
                    <span className={styles.featuredOriginalPrice}>₹{featured.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className={styles.btnGroup}>
                  <button onClick={() => setSelectedProduct(featured)} className={styles.quickViewBtn}>
                    <FiEye /> Quick View
                  </button>
                  <button className={styles.cartBtn}>
                    <FiShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Other Bestsellers */}
        <div className={styles.othersColumn}>
          {others.map((product) => {
            const isFav = isInWishlist(product.id);
            return (
              <div key={product.id} className={styles.smallCard}>
                <div className={styles.smallImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.smallImage} />
                  
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`${styles.wishlistBtnSmall} ${isFav ? styles.activeWishlist : ''}`}
                    aria-label="Wishlist"
                  >
                    {isFav ? (
                      <FaHeart className={styles.heartIconSmall} style={{ color: '#e91e63' }} />
                    ) : (
                      <FiHeart className={styles.heartIconSmall} />
                    )}
                  </button>

                  <div className={styles.smallActions}>
                    <button onClick={() => setSelectedProduct(product)} className={styles.actionBtnSmall} aria-label="Quick View">
                      <FiEye />
                    </button>
                    <button className={styles.actionBtnSmall} aria-label="Add to Cart">
                      <FiShoppingCart />
                    </button>
                  </div>
                </div>
                
                <div className={styles.smallContent}>
                  <span className={styles.smallFabric}>{product.fabric}</span>
                  <h4 className={styles.smallName}>{product.name}</h4>
                  <div className={styles.smallPriceGroup}>
                    <span className={styles.smallPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                    {product.originalPrice && (
                      <span className={styles.smallOriginalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}

export default BestSellers;
