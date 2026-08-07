import { Link } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi';
import { PATHS } from '../routes/paths';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header-container">
      {/* 1. Logo/Branding Section */}
      <Link to={PATHS.HOME} className="header-logo">
        Happy Sarees
      </Link>

      {/* 2. Navigation Menu Section */}
      <nav>
        <ul className="header-nav">
          <li>
            <Link to={PATHS.HOME} className="header-nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to={PATHS.SHOP} className="header-nav-link">
              Shop
            </Link>
          </li>
          <li>
            <Link to={PATHS.COLLECTIONS} className="header-nav-link">
              Collections
            </Link>
          </li>
          <li>
            <Link to={PATHS.NEW_ARRIVALS} className="header-nav-link">
              New Arrivals
            </Link>
          </li>
          <li>
            <Link to={PATHS.ABOUT} className="header-nav-link">
              About
            </Link>
          </li>
          <li>
            <Link to={PATHS.CONTACT} className="header-nav-link">
              Contact
            </Link>
          </li>
          <li>
            <Link to="/sell-with-us" className="header-nav-link" style={{ color: '#C5A059', fontWeight: 700 }}>
              Sell with Us
            </Link>
          </li>
        </ul>
      </nav>

      {/* 3. Actions Section (Search & Icon Links) */}
      <div className="header-actions">
        {/* Search Bar Input */}
        <div className="search-box">
          <span className="search-icon">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
          />
        </div>

        {/* Action Icon Links */}
        <div className="action-icons">
          <Link to={PATHS.WISHLIST} className="action-icon-link" aria-label="Wishlist">
            <FiHeart />
          </Link>
          <Link to={PATHS.CART} className="action-icon-link" aria-label="Cart">
            <FiShoppingCart />
          </Link>
          <Link to={PATHS.PROFILE} className="action-icon-link" aria-label="Profile">
            <FiUser />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
