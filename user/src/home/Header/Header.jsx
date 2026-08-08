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
const logoImg = '/logo.png';

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
  const [crownEnabled, setCrownEnabled] = useState(false);
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

  // Fetch Saree Crown campaign status (lightweight, public endpoint)
  useEffect(() => {
    let isMounted = true;
    api.getSareeCrownCampaign()
      .then((data) => {
        if (isMounted && data.enabled) {
          setCrownEnabled(true);
        }
      })
      .catch(() => {
        // Silently ignore — Crown simply won't appear
      });
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
  // 👑 Saree Crown — appended only when campaign is enabled
  const navMenuItems = [
    { label: 'Home',        path: PATHS.HOME,         hasDropdown: false },
    { label: 'Sarees',      path: PATHS.SHOP,         hasDropdown: false },
    { label: 'Occasions',   path: PATHS.SHOP,         hasDropdown: true, dropdownType: 'occasions' },
    { label: 'Fabrics',     path: PATHS.SHOP,         hasDropdown: true, dropdownType: 'fabrics' },
    { label: 'New Arrivals',path: PATHS.NEW_ARRIVALS, hasDropdown: false },
    { label: 'Sale',        path: PATHS.SALE,         hasDropdown: false },
    ...(crownEnabled ? [{ label: '👑 Crown', path: PATHS.SAREE_CROWN, hasDropdown: false, isCrown: true }] : []),
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
                  <Link to={menu.path} className={`${styles.navLink} ${menu.isCrown ? styles.crownNavLink : ''}`}>
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
              {/* Become a Seller link */}
              <a
                href={import.meta.env.VITE_SELLER_PORTAL_URL || 'http://localhost:5176'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sellerPortalBtn}
                title="Sell on Happy Sarees"
              >
                Sell on Happy Sarees
              </a>

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

              {/* Hamburger Button for Mobile */}
              <button
                className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
          <div className={styles.mobileDrawer}>
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.userNameText}>Menu</span>
              <button
                className={styles.mobileDrawerClose}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiX />
              </button>
            </div>
            
            <ul className={styles.mobileNavList}>
              {navMenuItems.map((menu, index) => (
                <li key={index} className={styles.mobileNavItem}>
                  <Link
                    to={menu.path}
                    className={`${styles.mobileNavLink} ${menu.isCrown ? styles.crownNavLink : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.mobileDrawerFooter}>
              <a
                href={import.meta.env.VITE_SELLER_PORTAL_URL || 'http://localhost:5176'}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileSellerBtn}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Become a Seller 👑
              </a>
              {!isAuthenticated ? (
                <div className={styles.mobileAuthBtns}>
                  <Link
                    to={PATHS.LOGIN}
                    className={styles.mobileBtnPrimary}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to={PATHS.REGISTER}
                    className={styles.mobileBtnSecondary}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className={styles.mobileAuthBtns}>
                  <Link
                    to={PATHS.PROFILE}
                    className={styles.mobileBtnPrimary}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    className={styles.mobileBtnSecondary}
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Full-screen Overlay Search Modal */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <button
              className={styles.closeSearchBtn}
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close Search"
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
              <button type="submit" className={styles.searchSubmitBtn}>Search</button>
            </form>

            {/* Popular Searches */}
            <div className={styles.trendingSection}>
              <span className={styles.trendingTitle}>Popular Searches:</span>
              <div className={styles.tagsGroup}>
                {TRENDING_SEARCHES.map((term, index) => (
                  <button
                    key={index}
                    type="button"
                    className={styles.tagBtn}
                    onClick={() => handleTrendingClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Search Results / Quick Matches */}
            {searchResults.length > 0 && (
              <div className={styles.searchResultsContainer}>
                <h4 className={styles.resultsHeading}>Quick Matches</h4>
                <div className={styles.resultsList}>
                  {searchResults.map((saree) => {
                    const imgUrl = saree.image || saree.image_url || (Array.isArray(saree.images) && saree.images[0]?.image_url) || 'https://via.placeholder.com/60x80';
                    const formattedPrice = saree.price ? Number(saree.price).toLocaleString('en-IN') : '0';
                    return (
                      <div
                        key={saree.id}
                        className={styles.searchResultRow}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          navigate(`/product/${saree.id}`);
                        }}
                      >
                        <img src={imgUrl} alt={saree.name} className={styles.resultThumb} />
                        <div className={styles.resultMeta}>
                          <span className={styles.resultTitle}>{saree.name}</span>
                          <span className={styles.resultSub}>
                            {saree.category_name || saree.fabric || 'Saree'} • <strong style={{ color: 'var(--primary-color)' }}>₹{formattedPrice}</strong>
                          </span>
                        </div>
                        <span className={styles.arrowIcon}>&rarr;</span>
                      </div>
                    );
                  })}
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
