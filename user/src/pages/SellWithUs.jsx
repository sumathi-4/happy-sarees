import React from 'react';
import { FiCheckCircle, FiTrendingUp, FiCheckSquare, FiAward, FiShield } from 'react-icons/fi';
import '../styles/SellWithUs.css';

function SellWithUs() {
  return (
    <div className="sell-wrapper">
      {/* Hero Banner Section */}
      <section className="sell-hero">
        <div className="sell-hero-overlay" />
        <div className="sell-hero-content">
          <span className="sell-eyebrow">HAPPY SAREES WEAVER PARTNERSHIP</span>
          <h1 className="sell-title">Showcase Your Atelier Legacy</h1>
          <p className="sell-subtitle">Connect your looms to millions of saree connoisseurs worldwide and scale your heritage brand.</p>
          <a href="http://localhost:5176/register" className="sell-cta-btn">
            Register Weaver Studio
          </a>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="sell-features">
        <div className="sell-section-header">
          <h2 className="sell-section-title">Why Sell on Happy Sarees?</h2>
          <p className="sell-section-subtitle">We empower direct weavers and boutique designers with premium digital storefront services.</p>
        </div>

        <div className="sell-grid">
          <div className="sell-feature-card">
            <div className="sell-feature-icon"><FiAward /></div>
            <h3>Premium Brand Position</h3>
            <p>Your weaves are featured in a luxury, cinematic customer catalog suited for high-end boutique craft.</p>
          </div>

          <div className="sell-feature-card">
            <div className="sell-feature-icon"><FiTrendingUp /></div>
            <h3>Direct-to-Consumer Margins</h3>
            <p>Cut out middlemen agents and traders. Sell directly to buyers and retain maximum weaving profits.</p>
          </div>

          <div className="sell-feature-card">
            <div className="sell-feature-icon"><FiCheckCircle /></div>
            <h3>Weekly Settled Payouts</h3>
            <p>Fully automated weekly financial bank ledger runs. We settle accounts into your verified bank account.</p>
          </div>

          <div className="sell-feature-card">
            <div className="sell-feature-icon"><FiShield /></div>
            <h3>Compliance Protection</h3>
            <p>Secure authentication, buyer payment dispute management, and direct compliance audit reports.</p>
          </div>
        </div>
      </section>

      {/* Verification steps workflow */}
      <section className="sell-steps-section">
        <div className="sell-section-header">
          <h2 className="sell-section-title">Weaver Onboarding Steps</h2>
          <p className="sell-section-subtitle">Get verified and list your first saree in three easy steps.</p>
        </div>

        <div className="sell-timeline">
          <div className="sell-timeline-step">
            <div className="sell-step-number">1</div>
            <div className="sell-step-info">
              <h3>Submit Studio Application</h3>
              <p>Register your credentials, upload your PAN card copy, business license, and a clear bank cancelled cheque copy.</p>
            </div>
          </div>

          <div className="sell-timeline-step">
            <div className="sell-step-number">2</div>
            <div className="sell-step-info">
              <h3>Compliance Review</h3>
              <p>Our administration verifies your bank details and PAN within 2-3 business days. You will get a notification upon approval.</p>
            </div>
          </div>

          <div className="sell-timeline-step">
            <div className="sell-step-number">3</div>
            <div className="sell-step-info">
              <h3>List & Package Sarees</h3>
              <p>Access your Seller Studio dashboard, list your sarees, and dispatch unstitched packs to buyer addresses.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <a href="http://localhost:5176/register" className="sell-cta-btn sell-cta-btn-gold">
            Begin Weaver Registration
          </a>
        </div>
      </section>
    </div>
  );
}

export default SellWithUs;
