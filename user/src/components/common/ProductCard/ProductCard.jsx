import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiEye, FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useToast } from '../../../context/ToastContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import api from '../../../services/api';
import styles from './ProductCard.module.css';

function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  imageFrameStyle
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const isWishlisted = isInWishlist(product?.id);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  if (!product) return null;

  // Multi-image gallery fallback: if product.images is an array, use it; otherwise provide multi-angle gallery images
  const defaultGallery = [
    product.image,
    "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
    "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
  ].filter(Boolean);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : defaultGallery;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product);
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  const handleAddCartClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product, 1);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Calculate discount percentage
  const calculatedDiscount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      {/* Product Image Frame */}
      <div className={styles.imageFrame} style={imageFrameStyle}>
        <Link to={`/product/${product.id}`} className={styles.imageLink}>
          <img
            src={images[currentImgIndex]}
            alt={product.name}
            className={styles.productImg}
          />
        </Link>

        {/* Wishlist Floating Button (Top Right) */}
        <button
          onClick={handleWishlistToggle}
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
          aria-label="Toggle Wishlist"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className={styles.heartIcon} style={{ color: '#e91e63' }} />
          ) : (
            <FiHeart className={styles.heartIcon} />
          )}
        </button>

        {/* Image Slider Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className={`${styles.sliderArrow} ${styles.prevArrow}`}
              aria-label="Previous image"
              title="Previous Image"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={handleNextImage}
              className={`${styles.sliderArrow} ${styles.nextArrow}`}
              aria-label="Next image"
              title="Next Image"
            >
              <FiChevronRight />
            </button>
          </>
        )}

        {/* On-Hover Gradient & Icon-Only Action Buttons */}
        <div className={styles.hoverOverlay}>
          <div className={styles.iconBtnGroup}>
            <button
              onClick={handleQuickViewClick}
              className={styles.iconActionBtn}
              aria-label="Quick View"
              title="Quick View"
            >
              <FiEye />
            </button>
            <button
              onClick={handleAddCartClick}
              className={styles.iconActionBtn}
              aria-label="Add to Cart"
              title="Add to Cart"
            >
              <FiShoppingCart />
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Meta Info */}
      <div className={styles.metaContent}>
        <h3 className={styles.productTitle}>
          <Link to={`/product/${product.id}`} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>

        <div className={styles.priceRow}>
          <span className={styles.sellingPrice}>
            Rs. {product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>
              Rs. {product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {calculatedDiscount && (
            <span className={styles.discountText}>
              ({calculatedDiscount}% OFF)
            </span>
          )}
        </div>

        {/* Dynamic Rating & Review Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '12px', color: 'var(--gold-color)', fontWeight: 600 }}>
          <span style={{ color: 'var(--gold-color)' }}>★ {(product.reviewCount && Number(product.reviewCount) > 0 && product.rating) ? Number(product.rating).toFixed(1) : '0.0'}</span>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 400 }}>({product.reviewCount || 0})</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
