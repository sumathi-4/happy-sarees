import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiTruck,
  FiHeadphones,
  FiUserCheck,
  FiFileText,
  FiGrid,
  FiChevronDown,
  FiAward,
  FiPercent,
  FiPackage,
  FiMail,
  FiPhone,
  FiClock,
  FiHelpCircle,
  FiStar,
  FiExternalLink
} from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Landing.module.css';

const logoImg = '/logo.png';
const fallbackSareeImg = '/images/woven_to_be_noticed_banner.jpg';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default
  const [stats, setStats] = useState({
    activeSellers: 150,
    sareesListed: 5000,
    payoutsDisbursed: 2500000
  });

  // Sticky nav scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live stats from backend
  useEffect(() => {
    let isMounted = true;
    sellerApi.getPublicStats()
      .then((data) => {
        if (isMounted && data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        console.warn('[Landing] Public stats fetch warning:', err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr+`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L+`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k+`;
    return `₹${val.toLocaleString('en-IN')}+`;
  };

  const handleImageError = (e, fallback = fallbackSareeImg) => {
    e.target.onerror = null;
    e.target.src = fallback;
  };

  // Content Data
  const benefits = [
    {
      icon: <FiGrid />,
      title: 'Effortless Listing',
      desc: 'Bulk upload your saree collections with guided fabric specifications, colors, and high-resolution image support.'
    },
    {
      icon: <FiDollarSign />,
      title: '7-Day Direct Payouts',
      desc: 'Automated bank transfers directly to your account every week with transparent itemized settlement reports.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Real-Time Analytics',
      desc: 'Track view counts, buyer interest, top-performing saree weaves, and revenue trends from your seller dashboard.'
    },
    {
      icon: <FiShield />,
      title: 'Verified Buyer Reach',
      desc: 'Connect directly with high-intent saree enthusiasts across India seeking authentic silk, cotton, and designer weaves.'
    },
    {
      icon: <FiTruck />,
      title: 'Pan-India Logistics',
      desc: 'Hassle-free doorstep pickup and insured shipping powered by India’s leading courier partners across 20,000+ pincodes.'
    },
    {
      icon: <FiHeadphones />,
      title: 'Dedicated Support',
      desc: 'Get direct phone & email support from a dedicated seller manager to help onboard, optimize listings, and scale sales.'
    }
  ];

  const steps = [
    {
      badge: '01',
      icon: <FiUserCheck />,
      title: 'Register & Verify',
      desc: 'Create your seller account in under 2 minutes with basic business and contact information.'
    },
    {
      badge: '02',
      icon: <FiFileText />,
      title: 'Submit GST & Bank Info',
      desc: 'Upload your GSTIN and bank details for automated identity verification and weekly settlements.'
    },
    {
      badge: '03',
      icon: <FiPackage />,
      title: 'List Your Sarees',
      desc: 'Add your saree inventory with prices, weave descriptions, fabric details, and photo galleries.'
    },
    {
      badge: '04',
      icon: <FiDollarSign />,
      title: 'Start Selling & Earning',
      desc: 'Receive orders, pack items for doorstep pickup, and get paid weekly as orders are fulfilled.'
    }
  ];

  const categories = [
    {
      id: 'kanchipuram',
      name: 'Kanchipuram Silk',
      subtext: 'Timeless silk craftsmanship',
      img: '/images/cat_kanchipuram.png',
      className: styles.bentoCardKanchipuram
    },
    {
      id: 'banarasi',
      name: 'Banarasi',
      subtext: 'Heritage woven in every thread',
      img: '/images/cat_banarasi.png',
      className: styles.bentoCardBanarasi
    },
    {
      id: 'organza',
      name: 'Organza',
      subtext: 'Light. Elegant. Contemporary.',
      img: '/images/cat_organza.png',
      className: styles.bentoCardOrganza
    },
    {
      id: 'cotton',
      name: 'Cotton',
      subtext: 'Everyday comfort and elegance',
      img: '/images/why_choose_us_models.png',
      className: styles.bentoCardCotton
    },
    {
      id: 'georgette',
      name: 'Georgette',
      subtext: 'Graceful & flowing styles',
      img: '/images/woven_to_be_noticed_banner.jpg',
      className: styles.bentoCardGeorgette
    },
    {
      id: 'bridal',
      name: 'Bridal Sarees',
      subtext: "For life's most beautiful moments",
      img: '/images/find_your_perfect_saree_banner.png',
      className: styles.bentoCardBridal
    }
  ];

  const testimonials = [
    {
      quote: '"Happy Sarees opened up buyers in Mumbai and Delhi that we could never reach from our weaver unit in Kanchipuram. The 7-day payout is always punctual!"',
      name: 'Meenakshi Silks',
      location: 'Kanchipuram, Tamil Nadu',
      stat: '+140% Monthly Growth'
    },
    {
      quote: '"Listing our Banarasi saree collection took less than an hour. The seller dashboard gives us complete control over inventory and orders."',
      name: 'Varanasi Artisans Co.',
      location: 'Varanasi, Uttar Pradesh',
      stat: '3,200+ Sarees Sold'
    },
    {
      quote: '"The 0% listing fee gave us the confidence to launch our entire designer silk range. Seller support is always responsive whenever we need guidance."',
      name: 'Radhika Sarees',
      location: 'Surat, Gujarat',
      stat: '4.9★ Seller Rating'
    }
  ];

  const faqs = [
    {
      q: 'What documents are required to register as a seller?',
      a: 'You need a valid GSTIN number, PAN card, active bank account in your business/individual name, and a pickup address inside India.'
    },
    {
      q: 'How much does it cost to list and sell sarees?',
      a: 'Registration and product listing on Happy Sarees are 100% FREE. There are no upfront fees or subscription costs. We only charge a small flat commission when a customer successfully buys your product.'
    },
    {
      q: 'How and when do I receive payouts for completed sales?',
      a: 'Payouts are calculated weekly and transferred automatically directly into your registered bank account every 7 days, complete with itemized settlement statements.'
    },
    {
      q: 'How does shipping and order pickup work?',
      a: 'You simply pack the ordered saree using standard packaging materials and mark it ready in your seller panel. Our courier partners will pick up the package from your doorstep and deliver it to the buyer.'
    },
    {
      q: 'How long does the seller account approval process take?',
      a: 'Once you submit your GST and bank details, our onboarding team reviews and approves your account within 24 to 48 business hours.'
    },
    {
      q: 'Can handloom weavers and small boutique owners sell here?',
      a: 'Yes! Happy Sarees is built specifically to empower saree weavers, handloom cooperatives, boutique designers, and authentic saree manufacturers of all sizes.'
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* ── SECTION 1: STICKY NAVIGATION ─────────────────────── */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.navbarSolid : styles.navbarTransparent}`}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.navLogo}>
            <img
              src={logoImg}
              alt="Happy Sarees Seller Portal"
              className={styles.logoImg}
              onError={(e) => handleImageError(e, '/logo.png')}
            />
            <span className={styles.logoBadge}>Seller Hub</span>
          </Link>

          <ul className={styles.navLinks}>
            <li><a href="#why-sell" className={styles.navLink}>Why Sell</a></li>
            <li><a href="#how-it-works" className={styles.navLink}>How It Works</a></li>
            <li><a href="#categories" className={styles.navLink}>Categories</a></li>
            <li><a href="#testimonials" className={styles.navLink}>Stories</a></li>
            <li><a href="#faq" className={styles.navLink}>FAQ</a></li>
          </ul>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.navLoginLink}>Seller Login</Link>
            <Link to="/register" className={styles.navRegisterBtn}>
              Become a Seller <FiArrowRight />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── SECTION 2: HERO SECTION ───────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroDecorBg}>
          <div className={styles.heroFloatPattern1} />
          <div className={styles.heroFloatPattern2} />
        </div>

        <div className={styles.sectionContainer}>
          <div className={styles.heroGrid}>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className={styles.trustPill}>
                <FiAward className={styles.trustCrownIcon} />
                <span>INDIA'S DEDICATED SAREE MARKETPLACE</span>
              </div>

              <h1 className={styles.heroTitle}>
                Expand Your Saree Business Nationwide on <span className={styles.heroTitleGradient}>Happy Sarees</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Sell directly to lakhs of verified saree buyers across India. Enjoy 0% listing fee, guaranteed 7-day direct bank payouts, and dedicated seller support.
              </p>

              <div className={styles.heroCtaGroup}>
                <Link to="/register" className={styles.heroPrimaryBtn}>
                  Become a Seller Today <FiArrowRight />
                </Link>
                <Link to="/login" className={styles.heroSecondaryBtn}>
                  Seller Login
                </Link>
              </div>

              {/* Stat Cards Row */}
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{stats.activeSellers}+</span>
                  <span className={styles.statLabel}>Verified Artisans</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{stats.sareesListed.toLocaleString('en-IN')}+</span>
                  <span className={styles.statLabel}>Sarees Listed</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{formatCurrency(stats.payoutsDisbursed)}</span>
                  <span className={styles.statLabel}>Paid to Sellers</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className={styles.heroVisualCol}
            >
              <div className={styles.heroImageFrame}>
                <img
                  src="/images/woven_to_be_noticed_banner.jpg"
                  alt="Saree Weaver Craftsmanship"
                  className={styles.heroImg}
                  onError={(e) => handleImageError(e, '/images/find_your_perfect_saree_banner.png')}
                />
                <div className={styles.heroBadgeFloating}>
                  <div className={styles.badgeIconCircle}>
                    <FiShield />
                  </div>
                  <div>
                    <span className={styles.badgeTextMain}>100% Verified Sellers</span>
                    <span className={styles.badgeTextSub}>Direct Bank Settlements</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TRUST STRIP MARQUEE ────────────────────── */}
      <div className={styles.trustMarqueeSection}>
        <div className={styles.marqueeTrack}>
          {[...Array(2)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              <span className={styles.marqueeItem}><FiPercent /> 0% LISTING FEE</span>
              <span className={styles.marqueeGoldDot}>✦</span>
              <span className={styles.marqueeItem}><FiDollarSign /> 7-DAY DIRECT BANK PAYOUTS</span>
              <span className={styles.marqueeGoldDot}>✦</span>
              <span className={styles.marqueeItem}><FiTruck /> PAN-INDIA DOORSTEP PICKUP</span>
              <span className={styles.marqueeGoldDot}>✦</span>
              <span className={styles.marqueeItem}><FiShield /> GST COMPLIANT & SECURE</span>
              <span className={styles.marqueeGoldDot}>✦</span>
              <span className={styles.marqueeItem}><FiHeadphones /> DEDICATED SELLER MANAGER</span>
              <span className={styles.marqueeGoldDot}>✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: WHY SELL ON HAPPY SAREES ───────────────── */}
      <section id="why-sell" className={styles.benefitsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrowTag}>WHY CHOOSE HAPPY SAREES</span>
            <h2 className={styles.sectionTitle}>Built Specifically for Saree Weavers & Sellers</h2>
            <p className={styles.sectionSubtitle}>
              Unlike generic marketplaces, Happy Sarees is tailored exclusively for saree craftsmanship, giving your collections the premium spotlight they deserve.
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {benefits.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={styles.benefitCard}
              >
                <div className={styles.benefitIconWrap}>{item.icon}</div>
                <h3 className={styles.benefitCardTitle}>{item.title}</h3>
                <p className={styles.benefitCardDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ───────────────────────────── */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrowTag}>SIMPLE ONBOARDING</span>
            <h2 className={styles.sectionTitle}>Start Selling in 4 Easy Steps</h2>
            <p className={styles.sectionSubtitle}>
              Get your saree brand online and start receiving orders across India in less than 48 hours.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className={styles.stepCard}
              >
                <span className={styles.stepBadge}>{step.badge}</span>
                <div className={styles.stepIconCircle}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6: WHAT YOU CAN SELL (CATEGORIES — BENTO GRID MATCHING IMAGE 1) ── */}
      <section id="categories" className={styles.categoriesSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrowTag}>SAREE CATEGORIES</span>
            <h2 className={styles.sectionTitle}>Made For Every Saree Story</h2>
            <p className={styles.sectionSubtitle}>
              From timeless classics to modern weaves, sell every style that represents your craft.
            </p>
          </div>

          <div className={styles.bentoCategoryGrid}>
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`${styles.bentoCard} ${cat.className}`}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className={styles.bentoImg}
                  onError={(e) => handleImageError(e, fallbackSareeImg)}
                />
                <div className={styles.bentoOverlay}>
                  <div className={styles.bentoContentTop}>
                    <h3 className={styles.bentoTitle}>{cat.name}</h3>
                    <p className={styles.bentoSubtext}>{cat.subtext}</p>
                  </div>
                  <div className={styles.bentoArrowBtn}>
                    <FiArrowRight />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7: COMMISSION & TRANSPARENCY STRIP ──────── */}
      <section className={styles.transparencySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.transparencyGrid}>
            <div className={styles.transparencyCard}>
              <div className={styles.transparencyBigValue}>0%</div>
              <h3 className={styles.transparencyTitle}>Listing Fee</h3>
              <p className={styles.transparencyDesc}>Zero upfront costs. Upload your entire inventory without paying per listing.</p>
            </div>
            <div className={styles.transparencyCard}>
              <div className={styles.transparencyBigValue}>7 Days</div>
              <h3 className={styles.transparencyTitle}>Payout Settlement</h3>
              <p className={styles.transparencyDesc}>Automated weekly bank transfers with transparent invoice breakdowns.</p>
            </div>
            <div className={styles.transparencyCard}>
              <div className={styles.transparencyBigValue}>20,000+</div>
              <h3 className={styles.transparencyTitle}>Pincodes Covered</h3>
              <p className={styles.transparencyDesc}>Doorstep courier pickup from your location to buyers all over India.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: SELLER SUCCESS STORIES ─────────────────── */}
      <section id="testimonials" className={styles.testimonialsSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrowTag}>SELLER TESTIMONIALS</span>
            <h2 className={styles.sectionTitle}>Trusted by Artisans & Brands Across India</h2>
            <p className={styles.sectionSubtitle}>
              Hear how weavers and boutique owners are scaling their business with Happy Sarees.
            </p>
          </div>

          <div className={styles.testimonialGrid}>
            {testimonials.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className={styles.testimonialCard}
              >
                <p className={styles.quoteText}>{item.quote}</p>
                <div className={styles.sellerProfileRow}>
                  <div>
                    <span className={styles.sellerName}>{item.name}</span>
                    <span className={styles.sellerLocation}>{item.location}</span>
                  </div>
                  <span className={styles.growthStatBadge}>{item.stat}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 9: FAQ ACCORDION ───────────────────────────── */}
      <section id="faq" className={styles.faqSection}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrowTag}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 className={styles.sectionTitle}>Everything You Need to Know</h2>
            <p className={styles.sectionSubtitle}>
              Got questions about selling on Happy Sarees? Here are straightforward answers.
            </p>
          </div>

          <div className={styles.faqWrapper}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`${styles.faqItem} ${isOpen ? styles.faqItemActive : ''}`}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown className={`${styles.faqChevron} ${isOpen ? styles.faqChevronOpen : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={styles.faqAnswer}>{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 10: CLOSING CTA BAND ───────────────────────── */}
      <section className={styles.closingCtaSection}>
        <div className={styles.closingCtaContainer}>
          <FiAward className={styles.closingCrownIcon} />
          <h2 className={styles.closingTitle}>Ready to Scale Your Saree Business Across India?</h2>
          <p className={styles.closingSubtitle}>
            Join 150+ verified weavers and boutique owners on Happy Sarees today. Free registration & 0% listing fee.
          </p>

          <div className={styles.closingCtaGroup}>
            <Link to="/register" className={styles.closingPrimaryBtn}>
              Register as Seller Now <FiArrowRight />
            </Link>
            <Link to="/login" className={styles.closingSecondaryBtn}>
              Seller Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 11: FOOTER (HIGH-CONTRAST & ATTRACTIVE) ───── */}
      <footer className={styles.footer}>
        <div className={styles.sectionContainer}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerLogoWrapper}>
                <img
                  src={logoImg}
                  alt="Happy Sarees Seller Hub"
                  className={styles.footerLogoImg}
                  onError={(e) => handleImageError(e, '/logo.png')}
                />
              </div>
              <p className={styles.footerBrandDesc}>
                Happy Sarees Seller Portal is India's dedicated marketplace platform empowering saree weavers, handloom artisans, and boutique sellers.
              </p>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Quick Links</h4>
              <ul className={styles.footerLinks}>
                <li className={styles.footerLinkItem}><a href="#why-sell" className={styles.footerLink}>Why Sell</a></li>
                <li className={styles.footerLinkItem}><a href="#how-it-works" className={styles.footerLink}>How It Works</a></li>
                <li className={styles.footerLinkItem}><a href="#categories" className={styles.footerLink}>Categories</a></li>
                <li className={styles.footerLinkItem}><a href="#testimonials" className={styles.footerLink}>Seller Stories</a></li>
                <li className={styles.footerLinkItem}><a href="#faq" className={styles.footerLink}>FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Seller Account</h4>
              <ul className={styles.footerLinks}>
                <li className={styles.footerLinkItem}><Link to="/register" className={styles.footerLink}>Register New Account</Link></li>
                <li className={styles.footerLinkItem}><Link to="/login" className={styles.footerLink}>Seller Login</Link></li>
                <li className={styles.footerLinkItem}><Link to="/status/pending" className={styles.footerLink}>Check Approval Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className={styles.footerColTitle}>Seller Support</h4>
              <ul className={styles.footerLinks}>
                <li className={styles.footerLinkItem}>
                  <FiMail className={styles.footerSupportIcon} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.82rem' }}>Email:</strong>
                    <a href="mailto:sellersupport@happysarees.com" className={styles.footerLink}>sellersupport@happysarees.com</a>
                  </div>
                </li>
                <li className={styles.footerLinkItem}>
                  <FiPhone className={styles.footerSupportIcon} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.82rem' }}>Phone:</strong>
                    <a href="tel:+918001234567" className={styles.footerLink}>+91 (800) 123-4567</a>
                  </div>
                </li>
                <li className={styles.footerLinkItem}>
                  <FiClock className={styles.footerSupportIcon} />
                  <div>
                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.82rem' }}>Support Hours:</strong>
                    <span className={styles.footerLink}>Mon - Sat, 9:00 AM - 7:00 PM IST</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div>© {new Date().getFullYear()} Happy Sarees. All Rights Reserved.</div>
            <div>
              <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className={styles.footerBackLink}>
                Visit Happy Sarees Customer Storefront <FiExternalLink />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
