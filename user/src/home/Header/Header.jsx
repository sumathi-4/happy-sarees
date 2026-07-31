import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiX, FiChevronRight, FiMenu } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import { PRODUCTS } from '../../data/mockData';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import styles from './Header.module.css';
const logoImg = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';

const TRENDING_SEARCHES = ['Banarasi Silk', 'Floral Organza', 'Red Bridal', 'Mulmul Cotton', 'Tissue Zari'];

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Dynamic Navigation Data connected to Neon Cloud PostgreSQL DB / Master Data
  const [navData, setNavData] = useState({
    occasions: [
      { name: 'Wedding', path: '/shop?occasion=wedding' },
      { name: 'Reception', path: '/shop?occasion=reception' },
      { name: 'Party Wear', path: '/shop?occasion=party' },
      { name: 'Office Wear', path: '/shop?occasion=office' },
      { name: 'Daily Wear', path: '/shop?occasion=daily-wear' },
      { name: 'Festive', path: '/shop?occasion=festive' },
      { name: 'Bridal', path: '/shop?occasion=bridal' }
    ],
    fabrics: [
      { name: 'Silk', path: '/shop?fabric=silk' },
      { name: 'Cotton', path: '/shop?fabric=cotton' },
      { name: 'Linen', path: '/shop?fabric=linen' },
      { name: 'Organza', path: '/shop?fabric=organza' },
      { name: 'Georgette', path: '/shop?fabric=georgette' },
      { name: 'Tissue', path: '/shop?fabric=tissue' },
      { name: 'Banarasi', path: '/shop?fabric=banarasi' },
      { name: 'Kanchipuram', path: '/shop?fabric=kanchipuram' },
      { name: 'Chiffon', path: '/shop?fabric=chiffon' }
    ]
  });

  // Fetch Live Navigation from Backend DB
  useEffect(() => {
    let isMounted = true;
    async function loadNavigation() {
      try {
        const res = await api.getNavigationMenu();
        const data = res.data || res;
        if (data && isMounted) {
          if (Array.isArray(data.occasions) && data.occasions.length > 0) {
            setNavData(prev => ({ ...prev, occasions: data.occasions }));
          }
          if (Array.isArray(data.fabrics) && data.fabrics.length > 0) {
            setNavData(prev => ({ ...prev, fabrics: data.fabrics }));
          }
        }
      } catch (err) {
        console.warn('[Header] Navigation menu backend fetch warning:', err.message);
      }
    }
    loadNavigation();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live search filtering via API
  useEffect(() => {
    let isMounted = true;
    if (searchQuery.trim().length > 1) {
      api.getProducts({ search: searchQuery.trim() })
        .then((data) => {
          if (isMounted && data.success && Array.isArray(data.products)) {
            setSearchResults(data.products.slice(0, 4));
          }
        })
        .catch(() => {
          if (isMounted) setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
    return () => { isMounted = false; };
  }, [searchQuery]);

  const handleTrendingClick = (term) => {
    setSearchQuery(term);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      setSearchQuery('');
      navigate(PATHS.SHOP);
    }
  };

  // Nav items configuration matching user requirement:
  // Home, Sarees (NO DROPDOWN), Occasions ▼, Fabrics ▼, New Arrivals, Sale
  const navMenuItems = [
    { label: 'Home', path: PATHS.HOME, hasDropdown: false },
    { label: 'Sarees', path: PATHS.SHOP, hasDropdown: false }, // NO DROPDOWN -> Opens Shop page with all sarees
    { label: 'Occasions', path: PATHS.SHOP, hasDropdown: true, dropdownType: 'occasions' },
    { label: 'Fabrics', path: PATHS.SHOP, hasDropdown: true, dropdownType: 'fabrics' },
    { label: 'New Arrivals', path: PATHS.NEW_ARRIVALS, hasDropdown: false },
    { label: 'Sale', path: PATHS.SALE, hasDropdown: false }
  ];

  return (
    <>
      <header className={`${styles.header} ${isSticky ? styles.sticky : ''}`}>
        <div className={styles.container}>
          
          {/* Brand Logo */}
          <Link to={PATHS.HOME} className={styles.logoContainer}>
            <img src={logoImg} alt="Happy Sarees" className={styles.logoImg} />
          </Link>

          {/* Navigation Menu */}
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {navMenuItems.map((menu, index) => {
                return (
                  <li
                    key={index}
                    className={`${styles.navItem} ${menu.hasDropdown ? styles.hasMega : ''}`}
                  >
                    <Link to={menu.path} className={styles.navLink}>
                      {menu.label}
                      {menu.hasDropdown && <span className={styles.arrow}>▼</span>}
                    </Link>

                    {/* Mega Dropdown Menu for Occasions & Fabrics */}
                    {menu.hasDropdown && (
                      <div className={styles.megaMenuContainer}>
                        <div className={styles.simpleGridMegaMenu}>
                          {/* Links Grid */}
                          <div className={styles.simpleGridLinks}>
                            {menu.dropdownType === 'occasions' && navData.occasions.map((item, i) => (
                              <Link key={i} to={item.path} className={styles.simpleGridLinkItem}>
                                {item.name}
                              </Link>
                            ))}

                            {menu.dropdownType === 'fabrics' && navData.fabrics.map((item, i) => (
                              <Link key={i} to={item.path} className={styles.simpleGridLinkItem}>
                                {item.name}
                              </Link>
                            ))}
                          </div>

                          {/* Promotional Banner Card */}
                          <div className={styles.simpleGridPromo}>
                            <div className={styles.simpleGridCard}>
                              <img 
                                src={
                                  menu.dropdownType === 'fabrics' 
                                    ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" 
                                    : "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
                                } 
                                alt={menu.dropdownType === 'fabrics' ? "Freshly Loomed Curations" : "Draped In Grandeur"} 
                                className={styles.simpleGridPromoImg} 
                              />
                              <div className={styles.simpleGridPromoOverlay}>
                                <h4 className={styles.simpleGridPromoTitle}>
                                  {menu.dropdownType === 'fabrics' ? "Freshly Loomed Curations" : "Draped In Grandeur"}
                                </h4>
                                <Link to={PATHS.SHOP} className={styles.simpleGridPromoCta}>
                                  Shop Now
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Header Actions Icons */}
          <div className={styles.actions}>
            <div className={styles.iconGroup}>
              {/* Search trigger button */}
              <button
                className={styles.actionIcon}
                onClick={() => setIsSearchOpen(true)}
                aria-label="Toggle Search"
              >
                <FiSearch />
              </button>

              {/* Wishlist Link */}
              <Link to={PATHS.WISHLIST} className={styles.actionIcon} aria-label="Wishlist">
                <FiHeart />
                <span className={styles.badge}>{wishlistCount}</span>
              </Link>

              {/* Shopping Cart Link */}
              <Link to={PATHS.CART} className={styles.actionIcon} aria-label="Cart">
                <FiShoppingCart />
                <span className={styles.badge}>{cartCount}</span>
              </Link>

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <div className={styles.userMenuWrapper}>
                  <Link to={PATHS.PROFILE} className={styles.actionIcon} aria-label="Account">
                    <FiUser />
                  </Link>
                </div>
              ) : (
                <Link to={PATHS.LOGIN} className={styles.actionIcon} aria-label="Login">
                  <FiUser />
                </Link>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Full-screen Overlay Search Modal */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <button
              className={styles.closeSearchBtn}
              onClick={() => setIsSearchOpen(false)}
            >
              <FiX />
            </button>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <FiSearch className={styles.searchModalIcon} />
              <input
                type="text"
                placeholder="Search for Sarees, Fabrics (Silk, Organza), Occasions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={styles.searchInputLarge}
              />
            </form>

            {/* Trending Suggestions */}
            <div className={styles.trendingSection}>
              <span className={styles.trendingTitle}>Popular Searches:</span>
              <div className={styles.tagsGroup}>
                {TRENDING_SEARCHES.map((term, index) => (
                  <button
                    key={index}
                    className={styles.tagBtn}
                    onClick={() => handleTrendingClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Search Results */}
            {searchResults.length > 0 && (
              <div className={styles.searchResultsContainer}>
                <h4 className={styles.resultsHeading}>Quick Matches</h4>
                <div className={styles.resultsGrid}>
                  {searchResults.map((saree) => (
                    <div
                      key={saree.id}
                      className={styles.searchResultCard}
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/product/${saree.id}`);
                      }}
                    >
                      <img src={saree.image} alt={saree.name} className={styles.resultImg} />
                      <div className={styles.resultInfo}>
                        <span className={styles.resultTitle}>{saree.name}</span>
                        <span className={styles.resultPrice}>₹{saree.price?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
