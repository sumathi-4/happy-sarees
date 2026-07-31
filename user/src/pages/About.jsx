import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { FiCheckCircle, FiHeart, FiArrowRight } from 'react-icons/fi';
import {
  MOCK_BRAND_VALUES,
  MOCK_WHY_HAPPY_SAREES,
  MOCK_JOURNEY_TIMELINE,
  MOCK_CUSTOMER_TESTIMONIALS
} from '../data/mockData';
import { PATHS } from '../routes/paths';
import styles from './About.module.css';

function About() {
  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb Navigation */}
      <div className={styles.container}>
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>About Us</span>
        </nav>
      </div>

      {/* Header Banner Title */}
      <section className={styles.headerTitleSection}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>ABOUT HAPPY SAREES</h1>
          <p className={styles.pageSubtitle}>Celebrating Tradition with Modern Elegance</p>
        </div>
      </section>

      {/* Full Width Editorial Hero Banner */}
      <section className={styles.heroBannerSection}>
        <div className={styles.heroImgFrame}>
          <img
            src="https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
            alt="Happy Sarees Heritage"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay}>
            <blockquote className={styles.heroQuote}>
              "Every Saree Tells a Story of Grace, Heritage & Craftsmanship"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyImgCol}>
              <div className={styles.storyImgWrapper}>
                <img
                  src="https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
                  alt="Happy Sarees Boutique Story"
                  className={styles.storyImg}
                />
                <div className={styles.experienceBadge}>
                  <strong>6+ Years</strong>
                  <span>Of Heritage Weaving</span>
                </div>
              </div>
            </div>

            <div className={styles.storyTextCol}>
              <span className={styles.sectionTag}>OUR STORY</span>
              <h2 className={styles.sectionHeading}>
                Bringing Handcrafted Elegance to Every Wardrobe
              </h2>
              <p className={styles.paragraph}>
                Happy Sarees was born out of a deep passion for Indian handlooms and the timeless art of saree weaving. What began in 2018 as a boutique vision in Coimbatore has flourished into a beloved destination for saree connoisseurs worldwide.
              </p>
              <p className={styles.paragraph}>
                We collaborate directly with master artisans and traditional weaving clusters across Kanchipuram, Varanasi, Bengal, and Chanderi. Every saree in our collection is a labor of love—woven with pure zari threads, authentic silk, and uncompromised dedication to quality.
              </p>
              <p className={styles.paragraph}>
                Our mission is simple: to empower women with drapes that make them feel royal, confident, and rooted in rich cultural grace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className={`${styles.sectionPadding} ${styles.softPinkBg}`}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>OUR VALUES</span>
            <h2 className={styles.sectionHeading}>The Pillars of Happy Sarees</h2>
          </div>

          <div className={styles.valuesGrid}>
            {MOCK_BRAND_VALUES.map((val, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}>{val.icon}</div>
                <h3 className={styles.valueTitle}>{val.title}</h3>
                <p className={styles.valueDesc}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Happy Sarees Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>WHY HAPPY SAREES</span>
            <h2 className={styles.sectionHeading}>Crafted With Excellence & Care</h2>
          </div>

          <div className={styles.whyGrid}>
            {MOCK_WHY_HAPPY_SAREES.map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div className={styles.checkCircle}>
                  <FiCheckCircle />
                </div>
                <div>
                  <h4 className={styles.whyTitle}>{item.title}</h4>
                  <p className={styles.whyDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey Section (Timeline) */}
      <section className={`${styles.sectionPadding} ${styles.softPinkBg}`}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>OUR JOURNEY</span>
            <h2 className={styles.sectionHeading}>Milestones of Grace & Growth</h2>
          </div>

          <div className={styles.timelineGrid}>
            {MOCK_JOURNEY_TIMELINE.map((item, i) => (
              <div key={i} className={styles.timelineCard}>
                <div className={styles.yearNode}>{item.year}</div>
                <h4 className={styles.timelineTitle}>{item.title}</h4>
                <p className={styles.timelineDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Craftsmanship Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.craftGrid}>
            <div className={styles.craftTextCol}>
              <span className={styles.sectionTag}>MEET OUR CRAFTSMANSHIP</span>
              <h2 className={styles.sectionHeading}>Artistry In Every Thread</h2>
              <p className={styles.paragraph}>
                Saree weaving is an intricate symphony of patience, precision, and heritage passed down through generations. From picking pure Mulberry silk filaments to setting up the jacquard loom for golden zari borders, every process requires dozens of skilled hands.
              </p>
              <p className={styles.paragraph}>
                By choosing Happy Sarees, you directly support artisan families, preserve traditional handloom heritage, and promote sustainable Indian textile craftsmanship.
              </p>
            </div>

            <div className={styles.craftImgCol}>
              <img
                src="https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
                alt="Happy Sarees Craftsmanship"
                className={styles.craftImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Love (Testimonials) */}
      <section className={`${styles.sectionPadding} ${styles.softPinkBg}`}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>CUSTOMER LOVE</span>
            <h2 className={styles.sectionHeading}>What Our Happy Patrons Say</h2>
          </div>

          <div className={styles.testimonialsGrid}>
            {MOCK_CUSTOMER_TESTIMONIALS.map((t) => (
              <div key={t.id} className={styles.testimonialCard}>
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={styles.starIcon} />
                  ))}
                </div>
                <blockquote className={styles.quoteText}>"{t.quote}"</blockquote>
                <div className={styles.userRow}>
                  <img src={t.avatar} alt={t.name} className={styles.userAvatar} />
                  <div>
                    <h4 className={styles.userName}>{t.name}</h4>
                    <span className={styles.userMeta}>{t.city} • Purchased {t.saree}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Discover Our Collections</h2>
            <p className={styles.ctaSub}>
              Explore over 1,000+ handcrafted silk, organza, banarasi & festive sarees.
            </p>
            <Link to={PATHS.SHOP} className={styles.ctaBtn}>
              Shop Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
