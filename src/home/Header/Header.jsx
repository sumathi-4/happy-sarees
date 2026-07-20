import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiX, FiChevronRight } from 'react-icons/fi';
import { PATHS } from '../../routes/paths';
import { PRODUCTS } from '../../data/mockData';
import styles from './Header.module.css';
import logoImg from '../../assets/logo.jpg';

// Dynamic navigation configuration data
const NAV_MENU_DATA = [
  { label: 'Home', path: PATHS.HOME },
  { label: 'New Arrivals', path: PATHS.NEW_ARRIVALS },
  {
    label: 'Collections',
    path: PATHS.COLLECTIONS,
    hasMegaMenu: true,
    menuType: 'collections',
    items: [
      { name: 'Wedding Collection', path: PATHS.COLLECTIONS },
      { name: 'Bridal Collection', path: PATHS.COLLECTIONS },
      { name: 'Festival Collection', path: PATHS.COLLECTIONS },
      { name: 'Premium Collection', path: PATHS.COLLECTIONS },
      { name: 'Celebrity Picks', path: PATHS.COLLECTIONS },
      { name: 'Trending Collection', path: PATHS.COLLECTIONS },
      { name: 'Office Collection', path: PATHS.COLLECTIONS },
      { name: 'View All Collections', path: PATHS.COLLECTIONS }
    ],
    featured: {
      title: 'Celebrate Every Occasion in Style',
      cta: 'Explore Collection',
      image: '/src/assets/wedding_saree.png',
      path: PATHS.COLLECTIONS
    }
  },
  {
    label: 'Shop',
    path: PATHS.SHOP,
    hasMegaMenu: true,
    menuType: 'simple-grid',
    items: [
      { name: 'All Sarees', path: PATHS.SHOP },
      { name: 'New Arrivals', path: PATHS.NEW_ARRIVALS },
      { name: 'Best Sellers', path: PATHS.SHOP },
      { name: 'Featured Sarees', path: PATHS.SHOP },
      { name: 'Premium Sarees', path: PATHS.SHOP }
    ],
    featured: {
      title: 'Freshly Loomed Curations',
      cta: 'Shop Now',
      image: '/src/assets/hero_saree_model.png',
      path: PATHS.SHOP
    }
  },
  {
    label: 'Occasions',
    path: PATHS.SHOP,
    hasMegaMenu: true,
    menuType: 'simple-grid',
    items: [
      { name: 'Wedding', path: PATHS.SHOP },
      { name: 'Reception', path: PATHS.SHOP },
      { name: 'Party', path: PATHS.SHOP },
      { name: 'Office', path: PATHS.SHOP },
      { name: 'Daily Wear', path: PATHS.SHOP },
      { name: 'Festive', path: PATHS.SHOP }
    ],
    featured: {
      title: 'Draped In Grandeur',
      cta: 'View Occasions',
      image: '/src/assets/festive_saree.png',
      path: PATHS.SHOP
    }
  },
  {
    label: 'Fabrics',
    path: PATHS.SHOP,
    hasMegaMenu: true,
    menuType: 'fabrics',
    fabricsList: [
      {
        id: 'silk',
        name: 'Silk',
        subcategories: [
          { name: 'Pure Silk', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80' },
          { name: 'Soft Silk', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80' },
          { name: 'Designer Silk', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=150&q=80' },
          { name: 'Handloom Silk', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' },
          { name: 'Printed Silk', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Discover Timeless Elegance',
          cta: 'Shop Silk Collection',
          image: '/src/assets/hero_saree_model.png',
          heading: 'Royal Mulberry Silk'
        }
      },
      {
        id: 'cotton',
        name: 'Cotton',
        subcategories: [
          { name: 'Handloom Cotton', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80' },
          { name: 'Mulmul Cotton', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' },
          { name: 'Chanderi Cotton', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Cool & Breathable Weaves',
          cta: 'Shop Cotton Collection',
          image: '/src/assets/festive_saree.png',
          heading: 'Organic Handloomed Cotton'
        }
      },
      {
        id: 'linen',
        name: 'Linen',
        subcategories: [
          { name: 'Pure Linen', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80' },
          { name: 'Linen Cotton', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80' },
          { name: 'Zari Linen', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Rustic Sophistication',
          cta: 'Shop Linen Collection',
          image: '/src/assets/hero_saree_model.png',
          heading: 'Premium Organic Flax Linen'
        }
      },
      {
        id: 'organza',
        name: 'Organza',
        subcategories: [
          { name: 'Printed Organza', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=150&q=80' },
          { name: 'Embroidered Organza', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80' },
          { name: 'Kora Organza', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Sheer Glasslike Drapes',
          cta: 'Shop Organza Collection',
          image: '/src/assets/festive_saree.png',
          heading: 'Floral Print Organza'
        }
      },
      {
        id: 'georgette',
        name: 'Georgette',
        subcategories: [
          { name: 'Pure Georgette', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' },
          { name: 'Banarasi Georgette', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Fluid & Graceful Silhouettes',
          cta: 'Shop Georgette Collection',
          image: '/src/assets/hero_saree_model.png',
          heading: 'Georgette Banarasi Weaves'
        }
      },
      {
        id: 'tissue',
        name: 'Tissue',
        subcategories: [
          { name: 'Gold Tissue', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80' },
          { name: 'Silver Tissue', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Metallic Shimmer & Glitz',
          cta: 'Shop Tissue Collection',
          image: '/src/assets/wedding_saree.png',
          heading: 'Golden Zari Tissue'
        }
      },
      {
        id: 'banarasi',
        name: 'Banarasi',
        subcategories: [
          { name: 'Katan Banarasi', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=150&q=80' },
          { name: 'Satin Banarasi', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Royal Heritage Weaves',
          cta: 'Shop Banarasi Collection',
          image: '/src/assets/wedding_saree.png',
          heading: 'Royal Banarasi Silk'
        }
      },
      {
        id: 'kanchipuram',
        name: 'Kanchipuram',
        subcategories: [
          { name: 'Pure Zari Kanchipuram', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80' },
          { name: 'Half-Fine Zari', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=150&q=80' }
        ],
        featured: {
          title: 'Temple Border Legends',
          cta: 'Shop Kanchipuram Collection',
          image: '/src/assets/wedding_saree.png',
          heading: 'Kanchipuram Bridal Wear'
        }
      }
    ]
  },
  { label: 'Sale', path: PATHS.SHOP },
  { label: 'About', path: PATHS.ABOUT },
  { label: 'Contact', path: PATHS.CONTACT }
];

const TRENDING_SEARCHES = ['Banarasi Silk', 'Floral Organza', 'Red Bridal', 'Mulmul Cotton', 'Tissue Zari'];

import { useAuth } from '../../context/AuthContext';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  const [activeFabricId, setActiveFabricId] = useState('silk');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

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

  // Live search filtering
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = PRODUCTS.filter(
        saree =>
          saree.name.toLowerCase().includes(q) ||
          saree.fabric.toLowerCase().includes(q)
      ).slice(0, 4);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
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

  // Mega Menu Helpers
  const renderCollectionsMegaMenu = (menu) => {
    return (
      <div className={styles.collectionsMegaMenu}>
        <div className={styles.collectionsGrid}>
          {menu.items.map((item, i) => (
            <Link key={i} to={item.path} className={styles.collectionLinkItem}>
              {item.name}
            </Link>
          ))}
        </div>
        <div className={styles.collectionsPromoBanner}>
          <img src={menu.featured.image} alt={menu.featured.title} className={styles.collectionsPromoBg} />
          <div className={styles.collectionsPromoContent}>
            <h3 className={styles.collectionsPromoText}>{menu.featured.title}</h3>
            <Link to={menu.featured.path} className={styles.collectionsPromoBtn}>
              {menu.featured.cta}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleGridMegaMenu = (menu) => {
    return (
      <div className={styles.simpleGridMegaMenu}>
        <div className={styles.simpleGridLinks}>
          {menu.items.map((item, i) => (
            <Link key={i} to={item.path} className={styles.simpleGridLinkItem}>
              {item.name}
            </Link>
          ))}
        </div>
        <div className={styles.simpleGridPromo}>
          <div className={styles.simpleGridCard}>
            <img src={menu.featured.image} alt={menu.featured.title} className={styles.simpleGridPromoImg} />
            <div className={styles.simpleGridPromoOverlay}>
              <h4 className={styles.simpleGridPromoTitle}>{menu.featured.title}</h4>
              <Link to={menu.featured.path} className={styles.simpleGridPromoCta}>
                {menu.featured.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFabricsMegaMenu = (menu) => {
    const activeFabric = menu.fabricsList.find(f => f.id === activeFabricId) || menu.fabricsList[0];

    return (
      <div className={styles.fabricsMegaMenu}>
        {/* Left Column: Fabric tab list */}
        <div className={styles.fabricsLeftCol}>
          {menu.fabricsList.map(fabric => (
            <div
              key={fabric.id}
              className={`${styles.fabricTabBtn} ${activeFabricId === fabric.id ? styles.activeFabricTab : ''}`}
              onMouseEnter={() => setActiveFabricId(fabric.id)}
            >
              <span className={styles.fabricBtnText}>{fabric.name}</span>
              <FiChevronRight className={styles.chevron} />
            </div>
          ))}
        </div>

        {/* Middle Column: Subcategories list with thumbnails */}
        <div className={styles.fabricsMidCol}>
          <h5 className={styles.columnHeading}>All {activeFabric.name} Sarees</h5>
          <div className={styles.subcatList}>
            {activeFabric.subcategories.map((sub, i) => (
              <Link key={i} to={PATHS.SHOP} className={styles.subcatCard}>
                <div className={styles.thumbWrapper}>
                  <img src={sub.image} alt={sub.name} className={styles.subcatThumb} />
                </div>
                <span className={styles.subcatName}>{sub.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Promotional banner card */}
        <div className={styles.fabricsRightCol}>
          <div className={styles.fabricsPromoCard}>
            <img src={activeFabric.featured.image} alt={activeFabric.featured.title} className={styles.promoImage} />
            <div className={styles.promoOverlay}>
              <span className={styles.promoHeading}>{activeFabric.featured.heading}</span>
              <h4 className={styles.promoTitle}>{activeFabric.featured.title}</h4>
              <Link to={PATHS.SHOP} className={styles.promoCtaBtn}>
                {activeFabric.featured.cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              {NAV_MENU_DATA.map((menu, index) => {
                const hasMega = menu.hasMegaMenu;
                return (
                  <li
                    key={index}
                    className={`${styles.navItem} ${hasMega ? styles.hasMega : ''}`}
                    onMouseEnter={() => {
                      if (menu.menuType === 'fabrics') {
                        setActiveFabricId('silk');
                      }
                    }}
                  >
                    <Link to={menu.path} className={styles.navLink}>
                      {menu.label}
                      {hasMega && <span className={styles.arrow}>▼</span>}
                    </Link>

                    {hasMega && (
                      <div className={styles.megaMenuContainer}>
                        {menu.menuType === 'collections' && renderCollectionsMegaMenu(menu)}
                        {menu.menuType === 'fabrics' && renderFabricsMegaMenu(menu)}
                        {menu.menuType === 'simple-grid' && renderSimpleGridMegaMenu(menu)}
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

              <Link to={PATHS.WISHLIST} className={styles.actionIcon} aria-label="Wishlist">
                <FiHeart />
                <span className={styles.badge}>2</span>
              </Link>
              <Link to={PATHS.CART} className={styles.actionIcon} aria-label="Cart">
                <FiShoppingCart />
                <span className={styles.badge}>1</span>
              </Link>
              {/* User Profile Dropdown Menu */}
              <div className={styles.userMenuWrapper}>
                {isAuthenticated ? (
                  <>
                    <Link to={PATHS.PROFILE} className={styles.actionIcon} aria-label="My Account">
                      <FiUser />
                    </Link>

                    <div className={styles.userDropdown}>
                      <div className={styles.userHeaderBox}>
                        <span className={styles.userGreeting}>Welcome Back 👋</span>
                        <strong className={styles.userNameText}>{user?.name || 'Sumathi'}</strong>
                      </div>
                      <Link to={PATHS.PROFILE} className={styles.dropdownLink}>
                        👤 My Account
                      </Link>
                      <Link to={`${PATHS.PROFILE}?tab=orders`} className={styles.dropdownLink}>
                        📦 My Orders
                      </Link>
                      <Link to={`${PATHS.PROFILE}?tab=wishlist`} className={styles.dropdownLink}>
                        ♡ Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate(PATHS.LOGIN);
                        }}
                        className={`${styles.dropdownLink} ${styles.logoutBtn}`}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <Link to={PATHS.LOGIN} className={styles.actionIcon} aria-label="Login">
                    <FiUser />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sliding Search Drawer Overlay */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <div className={styles.searchHeader}>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <FiSearch className={styles.drawerSearchIcon} />
                <input
                  type="text"
                  placeholder="Search silk, organza, banarasi, linen sarees..."
                  className={styles.drawerSearchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.searchSubmitBtn}>Search</button>
              </form>
              <button
                className={styles.closeSearchBtn}
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                aria-label="Close Search"
              >
                <FiX />
              </button>
            </div>

            {/* Trending Keywords */}
            <div className={styles.searchBody}>
              <div className={styles.trendingSection}>
                <h5 className={styles.sectionTitle}>Trending Searches</h5>
                <div className={styles.trendingPills}>
                  {TRENDING_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleTrendingClick(term)}
                      className={styles.trendingPill}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length > 1 && (
                <div className={styles.searchResultsSection}>
                  <h5 className={styles.sectionTitle}>Matching Curations</h5>
                  {searchResults.length > 0 ? (
                    <div className={styles.resultsGrid}>
                      {searchResults.map((saree) => (
                        <Link
                          key={saree.id}
                          to={`/product/${saree.id}`}
                          className={styles.resultItem}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <img src={saree.image} alt={saree.name} className={styles.resultThumb} />
                          <div className={styles.resultMeta}>
                            <h6 className={styles.resultName}>{saree.name}</h6>
                            <span className={styles.resultFabric}>{saree.fabric}</span>
                            <div className={styles.resultPriceRow}>
                              <span className={styles.resultPrice}>₹{saree.price.toLocaleString()}</span>
                              {saree.originalPrice > saree.price && (
                                <span className={styles.resultOldPrice}>₹{saree.originalPrice.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noResultsText}>No sarees found matching "{searchQuery}"</p>
                  )}
                  {searchResults.length > 0 && (
                    <Link
                      to={PATHS.SHOP}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className={styles.viewAllResultsBtn}
                    >
                      View All Search Results
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
