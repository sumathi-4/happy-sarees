import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../services/api';
import styles from './SignatureCollections.module.css';

// Pre-calculated aesthetic card rotations for the hanging polaroid scatter look
const ROTATION_ANGLES = [-3.5, 2.4, -2.8, 3.2, -1.8, 2.6, -3.0, 2.2];

// Fallback accents for single-word occasion titles
const ACCENT_MAP = {
  bridal: 'Royal',
  wedding: 'Elegance',
  festive: 'Glamour',
  party: 'Favs',
  casual: 'Styles',
  daily: 'Days',
  'daily wear': 'Days',
  office: 'Grace',
  puja: 'Traditional',
  reception: 'Chic',
  anniversary: 'Memories'
};

function formatOccasionTypography(name = '') {
  const trimmed = name.trim();
  if (!trimmed) return { mainText: 'OCCASION', accentText: 'Favs' };

  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const mainText = words[0].toUpperCase();
    const accentText = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return { mainText, accentText };
  } else {
    const mainText = trimmed.toUpperCase();
    const key = trimmed.toLowerCase();
    const accentText = ACCENT_MAP[key] || 'Styles';
    return { mainText, accentText };
  }
}

function SignatureCollections() {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOccasions() {
      try {
        const res = await api.getOccasions();
        if (res && res.success && Array.isArray(res.occasions) && res.occasions.length > 0) {
          if (isMounted) setOccasions(res.occasions);
        } else {
          // Fallback to navigation menu API if endpoint returns empty array
          const navRes = await api.getNavigationMenu();
          if (navRes && Array.isArray(navRes.occasions) && navRes.occasions.length > 0) {
            const mapped = navRes.occasions.map((o, idx) => ({
              id: idx + 1,
              name: o.name,
              slug: o.slug || o.name.toLowerCase().replace(/\s+/g, '-'),
              path: o.path || `/shop?occasion=${encodeURIComponent(o.slug || o.name.toLowerCase().replace(/\s+/g, '-'))}`,
              image: getFallbackImage(o.name)
            }));
            if (isMounted) setOccasions(mapped);
          }
        }
      } catch (err) {
        console.warn('[ShopByOccasion] Dynamic fetch notice:', err.message);
        // Fallback default dynamic array if offline
        if (isMounted) {
          setOccasions([
            { id: 1, name: 'Wedding Elegance', slug: 'wedding', image: '/src/assets/wedding_saree.png' },
            { id: 2, name: 'Bridal Royal', slug: 'bridal', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop' },
            { id: 3, name: 'Festival Glamour', slug: 'festive', image: '/src/assets/festive_saree.png' },
            { id: 4, name: 'Office Grace', slug: 'office', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
            { id: 5, name: 'Party Favs', slug: 'party', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop' }
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOccasions();

    return () => {
      isMounted = false;
    };
  }, []);

  function getFallbackImage(name) {
    const lower = (name || '').toLowerCase();
    if (lower.includes('wedding')) return '/src/assets/wedding_saree.png';
    if (lower.includes('festive')) return '/src/assets/festive_saree.png';
    if (lower.includes('bridal')) return 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop';
    if (lower.includes('office')) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';
  }

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.tagline}>Draped In Grandeur</span>
          <h2 className={styles.title}>Shop By Occasion</h2>
          <div className={styles.divider}>
            <span className={styles.dot}></span>
          </div>
        </div>
        <div className={styles.loadingSkeletonContainer}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className={styles.skeletonCard} />
          ))}
        </div>
      </section>
    );
  }

  if (occasions.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.tagline}>Draped In Grandeur</span>
        <h2 className={styles.title}>Shop By Occasion</h2>
        <div className={styles.divider}>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.carouselWrapper}>
        {/* Navigation Buttons for Desktop */}
        <button 
          className={`${styles.navBtn} ${styles.prevBtn}`}
          onClick={() => scroll('left')}
          aria-label="Scroll Left"
        >
          <FiChevronLeft />
        </button>

        <div className={styles.carousel} ref={carouselRef}>
          {occasions.map((occ, idx) => {
            const rotation = ROTATION_ANGLES[idx % ROTATION_ANGLES.length];
            const { mainText, accentText } = formatOccasionTypography(occ.name);
            const imageUrl = occ.image || occ.image_data || getFallbackImage(occ.name);
            const targetSlug = occ.slug || occ.name.toLowerCase().trim().replace(/\s+/g, '-');
            const targetPath = occ.path || `/shop?occasion=${encodeURIComponent(targetSlug)}`;

            return (
              <Link 
                key={occ.id || idx} 
                to={targetPath}
                className={styles.polaroidCard}
                style={{ '--card-rotation': `${rotation}deg` }}
              >
                {/* Realistic 3D Long Metallic Paper Clip */}
                <div className={styles.paperClipWrapper}>
                  <svg className={styles.paperClipSvg} viewBox="0 0 36 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id={`metallicWire_${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f3f4f6" />
                        <stop offset="25%" stopColor="#9ca3af" />
                        <stop offset="55%" stopColor="#e5e7eb" />
                        <stop offset="85%" stopColor="#4b5563" />
                        <stop offset="100%" stopColor="#1f2937" />
                      </linearGradient>
                      <filter id={`clipDropShadow_${idx}`} x="-30%" y="-20%" width="170%" height="150%">
                        <feDropShadow dx="3.5" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.42"/>
                        <feDropShadow dx="1" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25"/>
                      </filter>
                    </defs>
                    {/* Shadow & Metallic Outer Wire */}
                    <path 
                      d="M 15 22 
                         C 15 10, 30 10, 30 22 
                         L 30 98 
                         C 30 112, 6 112, 6 98 
                         L 6 32 
                         C 6 16, 22 16, 22 32 
                         L 22 86 
                         C 22 93, 14 93, 14 86 
                         L 14 42" 
                      stroke={`url(#metallicWire_${idx})`} 
                      strokeWidth="3.4" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      filter={`url(#clipDropShadow_${idx})`}
                    />
                    {/* 3D Specular Highlight Line */}
                    <path 
                      d="M 15 22 
                         C 15 10, 30 10, 30 22 
                         L 30 98 
                         C 30 112, 6 112, 6 98 
                         L 6 32 
                         C 6 16, 22 16, 22 32 
                         L 22 86 
                         C 22 93, 14 93, 14 86 
                         L 14 42" 
                      stroke="#ffffff" 
                      strokeWidth="1.1" 
                      strokeOpacity="0.85"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Polaroid Photo Frame */}
                <div className={styles.photoContainer}>
                  <img 
                    src={imageUrl} 
                    alt={occ.name} 
                    className={styles.photo}
                    loading="lazy" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFallbackImage(occ.name);
                    }}
                  />
                  <div className={styles.photoOverlay}></div>
                </div>

                {/* Polaroid Bottom Typography Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.titleGroup}>
                    <span className={styles.mainTitle}>{mainText}</span>
                    <span className={styles.accentText}>{accentText}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button 
          className={`${styles.navBtn} ${styles.nextBtn}`}
          onClick={() => scroll('right')}
          aria-label="Scroll Right"
        >
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}

export default SignatureCollections;
