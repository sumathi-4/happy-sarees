import React, { useState } from 'react';
import { FiHeart, FiEye, FiShoppingCart, FiStar, FiX } from 'react-icons/fi';
import { PRODUCTS } from '../../data/mockData';
import styles from './BestSellers.module.css';

function BestSellers() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlist, setWishlist] = useState(PRODUCTS.filter(p => p.isWishlisted).map(p => p.id));

  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);
  const featured = bestSellers.find((p) => p.isFeaturedBestSeller) || bestSellers[0];
  const others = bestSellers.filter((p) => p.id !== featured.id);

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
                  <span className={styles.featuredOriginalPrice}>₹{featured.originalPrice.toLocaleString('en-IN')}</span>
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
                    <span className={styles.smallOriginalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specification Modal (Reused) */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedProduct(null)} aria-label="Close modal">
              <FiX />
            </button>
            <div className={styles.modalBody}>
              <div className={styles.modalImageWrapper}>
                <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.modalImage} />
              </div>
              <div className={styles.modalDetails}>
                <span className={styles.modalFabric}>{selectedProduct.fabric}</span>
                <h3 className={styles.modalName}>{selectedProduct.name}</h3>
                
                <div className={styles.modalRating}>
                  <span className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={i < Math.floor(selectedProduct.rating) ? styles.starFilled : styles.starEmpty} 
                      />
                    ))}
                  </span>
                  <span>({selectedProduct.rating} / 5)</span>
                </div>

                <div className={styles.modalPriceContainer}>
                  <span className={styles.modalPrice}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  {selectedProduct.originalPrice && (
                    <span className={styles.modalOriginalPrice}>₹{selectedProduct.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  {selectedProduct.discountBadge && (
                    <span className={styles.modalDiscount}>{selectedProduct.discountBadge}</span>
                  )}
                </div>

                {/* Detailed Specifications */}
                <div className={styles.specsTable}>
                  <h4 className={styles.specsTitle}>Specifications</h4>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Fabric Type</span>
                    <span className={styles.specValue}>{selectedProduct.fabric}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Saree Size</span>
                    <span className={styles.specValue}>{selectedProduct.height} height x {selectedProduct.width} width</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Matching Blouse</span>
                    <span className={styles.specValue}>{selectedProduct.blouseIncluded ? 'Included' : 'Not Included'}</span>
                  </div>
                  {selectedProduct.blouseIncluded && (
                    <div className={styles.specRow}>
                      <span className={styles.specLabel}>Blouse Fabric Length</span>
                      <span className={styles.specValue}>{selectedProduct.blouseSize}</span>
                    </div>
                  )}
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Availability</span>
                    <span className={selectedProduct.inStock ? styles.inStock : styles.outOfStock}>
                      {selectedProduct.inStock ? `Available (${selectedProduct.stockCount} items left)` : 'Sold Out'}
                    </span>
                  </div>
                </div>

                <button 
                  className={styles.modalAddToCartBtn} 
                  disabled={!selectedProduct.inStock}
                >
                  <FiShoppingCart /> Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default BestSellers;
