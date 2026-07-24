import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare
} from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaPinterestP } from 'react-icons/fa';
import { MOCK_FAQS } from '../data/mockData';
import { PATHS } from '../routes/paths';
import { useStoreSettings } from '../context/StoreSettingsContext';
import styles from './Contact.module.css';

function Contact() {
  const { storeSettings } = useStoreSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [openFaqId, setOpenFaqId] = useState('faq1');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please complete all required fields before sending your message.');
      return;
    }
    alert(`Thank you, ${formData.name}! Your message has been received. Our team will contact you shortly.`);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: ''
    });
  };

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb Navigation */}
      <div className={styles.container}>
        <nav className={styles.breadcrumbBar} aria-label="Breadcrumb">
          <Link to={PATHS.HOME} className={styles.crumbLink}>Home</Link>
          <span className={styles.separator}>&gt;</span>
          <span className={styles.activeCrumb}>Contact Us</span>
        </nav>
      </div>

      {/* Header Banner Title */}
      <section className={styles.headerTitleSection}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>CONTACT HAPPY SAREES</h1>
          <p className={styles.pageSubtitle}>We'd Love to Hear From You</p>
        </div>
      </section>

      {/* Main Contact 2-Column Block */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {/* Left Card: Contact Information */}
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Contact Information</h3>
              <p className={styles.cardSub}>
                Have a question about our silk saree collections, custom stitching, or delivery status? Reach out to us anytime!
              </p>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <div className={styles.iconCircle}>
                    <FiMapPin />
                  </div>
                  <div>
                    <h5 className={styles.infoLabel}>Store Address</h5>
                    <p className={styles.infoValue}>
                      Happy Sarees Flagship Store, 123 Annasalai Silk Corridor, Coimbatore, Tamil Nadu - 641001, India
                    </p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconCircle}>
                    <FiPhone />
                  </div>
                  <div>
                    <h5 className={styles.infoLabel}>Phone & WhatsApp</h5>
                    <p className={styles.infoValue}>{storeSettings.phone || '+91 98765 43210'} / {storeSettings.whatsapp || '+91 91234 56789'}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconCircle}>
                    <FiMail />
                  </div>
                  <div>
                    <h5 className={styles.infoLabel}>Email</h5>
                    <p className={styles.infoValue}>{storeSettings.email || 'support@happysarees.com'}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.iconCircle}>
                    <FiClock />
                  </div>
                  <div>
                    <h5 className={styles.infoLabel}>Business Hours</h5>
                    <p className={styles.infoValue}>
                      {storeSettings.workingHours || 'Mon - Sat: 9:00 AM - 7:00 PM IST'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Buttons */}
              <div className={styles.socialBlock}>
                <h5 className={styles.socialTitle}>Connect With Us</h5>
                <div className={styles.socialRow}>
                  {storeSettings.whatsappLink && (
                    <a href={storeSettings.whatsappLink} target="_blank" rel="noreferrer" className={styles.socialBtn} title="WhatsApp">
                      <FaWhatsapp />
                    </a>
                  )}
                  {storeSettings.instagram && (
                    <a href={storeSettings.instagram} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Instagram">
                      <FaInstagram />
                    </a>
                  )}
                  {storeSettings.facebook && (
                    <a href={storeSettings.facebook} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Facebook">
                      <FaFacebookF />
                    </a>
                  )}
                  {storeSettings.pinterest && (
                    <a href={storeSettings.pinterest} target="_blank" rel="noreferrer" className={styles.socialBtn} title="Pinterest">
                      <FaPinterestP />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Contact Form */}
            <div className={styles.formCard}>
              <h3 className={styles.cardTitle}>Send us a Message</h3>
              <p className={styles.cardSub}>Fill in the form below and our saree stylist team will reply within 2 hours.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-name">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      required
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-phone">Mobile Number</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.inputField}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-subject">Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={styles.selectField}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Tracking">Order Tracking</option>
                      <option value="Blouse Stitching">Blouse Customization</option>
                      <option value="Bulk Order">Bulk / Wedding Inquiry</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Write your query or request here..."
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.textareaField}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Send Message <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Our Store (Google Maps Placeholder) */}
      <section className={styles.mapSection}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>VISIT OUR STORE</span>
            <h2 className={styles.sectionHeading}>Experience Our Flagship Boutique</h2>
          </div>

          <div className={styles.mapCard}>
            <div className={styles.mapFrame}>
              <div className={styles.mapOverlayContent}>
                <div className={styles.mapPinBadge}>📍 Happy Sarees Coimbatore Flagship Store</div>
                <p className={styles.mapAddress}>123 Annasalai Silk Corridor, Coimbatore, Tamil Nadu - 641001</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mapDirectionsBtn}
                >
                  Get Directions on Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop With Us Section */}
      <section className={styles.sectionPadding}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIconCircle}><FiCheckCircle /></div>
              <h4 className={styles.trustTitle}>Premium Quality</h4>
              <p className={styles.trustSub}>100% Silk Mark certified pure fabrics</p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconCircle}><FiCheckCircle /></div>
              <h4 className={styles.trustTitle}>Trusted Brand</h4>
              <p className={styles.trustSub}>100,000+ happy patrons worldwide</p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconCircle}><FiCheckCircle /></div>
              <h4 className={styles.trustTitle}>Secure Payments</h4>
              <p className={styles.trustSub}>256-bit encrypted safe checkout</p>
            </div>
            <div className={styles.trustCard}>
              <div className={styles.trustIconCircle}><FiCheckCircle /></div>
              <h4 className={styles.trustTitle}>Easy Returns</h4>
              <p className={styles.trustSub}>7-day hassle-free doorstep returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className={`${styles.sectionPadding} ${styles.softPinkBg}`}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className={styles.sectionTag}>FREQUENTLY ASKED QUESTIONS</span>
            <h2 className={styles.sectionHeading}>Got Questions? We Have Answers</h2>
          </div>

          <div className={styles.faqList}>
            {MOCK_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div key={faq.id} className={styles.faqCard}>
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className={styles.faqHeader}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.faqQuestion}>{faq.question}</span>
                    <span className={styles.faqIcon}>
                      {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className={styles.faqBody}>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
