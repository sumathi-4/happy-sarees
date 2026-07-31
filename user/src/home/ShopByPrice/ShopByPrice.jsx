import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ShopByPrice.module.css';

const cutout1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477013/happy_sarees/site_assets/price_cutouts/cgr7fkcsw84lhsgtslf7.png';
const cutout2 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477014/happy_sarees/site_assets/price_cutouts/iszyfx20414jbu7j3ueu.png';
const cutout3 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477015/happy_sarees/site_assets/price_cutouts/f7szjystkkrzyjfg0pad.png';
const cutout4 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477016/happy_sarees/site_assets/price_cutouts/jpxagh6bdogjtmnl07py.png';

const PRICE_CATEGORIES = [
  {
    id: 1,
    title: '₹999 & Below',
    minPrice: 0,
    maxPrice: 999,
    image: cutout1,
    alt: 'Sarees ₹999 & Below'
  },
  {
    id: 2,
    title: '₹1,000 – ₹1,999',
    minPrice: 1000,
    maxPrice: 1999,
    image: cutout2,
    alt: 'Sarees ₹1,000 – ₹1,999'
  },
  {
    id: 3,
    title: '₹2,000 – ₹2,999',
    minPrice: 2000,
    maxPrice: 2999,
    image: cutout3,
    alt: 'Sarees ₹2,000 – ₹2,999',
    isSmaller: true
  },
  {
    id: 4,
    title: '₹3,000+',
    minPrice: 3000,
    maxPrice: null,
    image: cutout4,
    alt: 'Sarees ₹3,000+'
  }
];

function ShopByPrice() {
  const navigate = useNavigate();

  const handleCardClick = (item) => {
    let url = `/sarees?minPrice=${item.minPrice}`;
    if (item.maxPrice !== null) {
      url += `&maxPrice=${item.maxPrice}`;
    }
    navigate(url);
  };

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Authentic Budget Edits</span>
        <h2 className={styles.title}>SHOP BY PRICE</h2>
        <div className={styles.titleDivider}>
          <span className={styles.line}></span>
          <span className={styles.dot}></span>
          <span className={styles.line}></span>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {PRICE_CATEGORIES.map((item) => (
          <div 
            key={item.id} 
            className={styles.cardItem}
            onClick={() => handleCardClick(item)}
          >
            {/* Transparent 3D Scalloped Cutout PNG Image with Gold Shimmer Glow */}
            <div className={`${styles.imageWrapper} ${item.isSmaller ? styles.scaledWrapper : ''}`}>
              <div className={styles.shimmerEffect}></div>
              <img 
                src={item.image} 
                alt={item.alt} 
                className={styles.cutoutImage}
                loading="lazy"
              />
            </div>

            {/* Price Label Centered Underneath Outside Image */}
            <div className={styles.labelWrapper}>
              <h3 className={styles.priceLabel}>{item.title}</h3>
              <span className={styles.shopNowHint}>Explore Collection →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShopByPrice;
