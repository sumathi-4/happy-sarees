import React, { useState, useEffect } from 'react';
import { FiHeart, FiEye, FiShoppingCart } from 'react-icons/fi';
import { PRODUCTS } from '../../data/mockData';
import api from '../../services/api';
import QuickViewModal from '../../shop/QuickViewModal/QuickViewModal';
import styles from './BestSellers.module.css';

function BestSellers() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bestsellerList, setBestsellerList] = useState(() => PRODUCTS.filter(p => p.isBestSeller));
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let isMounted = true;
    api.getBestsellers()
      .then((data) => {
        if (isMounted && data.success && data.products.length > 0) {
          setBestsellerList(data.products);
        }
      })
      .catch((err) => {
        console.log('[BestSellers] Operating with preloaded fallback products:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  const featured = bestsellerList.find((p) => p.isFeaturedBestSeller) || bestsellerList[0] || PRODUCTS[0];
  const others = bestsellerList.filter((p) => p.id !== featured.id);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

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
                onClick={() => toggleWishlist(featured.id)}
                className={`${styles.wishlistBtn} ${wishlist.includes(featured.id) ? styles.activeWishlist : ''}`}
                aria-label="Wishlist"
              >
                <FiHeart className={styles.heartIcon} />
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
            const isFav = wishlist.includes(product.id);
            return (
              <div key={product.id} className={styles.smallCard}>
                <div className={styles.smallImageWrapper}>
                  <img src={product.image} alt={product.name} className={styles.smallImage} />
                  
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`${styles.wishlistBtnSmall} ${isFav ? styles.activeWishlist : ''}`}
                    aria-label="Wishlist"
                  >
                    <FiHeart className={styles.heartIconSmall} />
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
