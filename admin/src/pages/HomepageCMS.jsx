import React, { useState } from 'react';
import { 
  FiVolume2, FiImage, FiGift, FiStar, FiHeart, FiAward, 
  FiGrid, FiCheckSquare, FiSmile, FiPlayCircle, FiMail, FiLayout,
  FiCheck, FiRefreshCw, FiEye, FiUpload, FiTrash2, FiPlus, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import AnnouncementManager from '../components/AnnouncementManager';
import styles from '../styles/HomepageCMS.module.css';

function HomepageCMS() {
  const { cmsData, setCmsData, updateCmsSection, refreshCms, products, masterData } = useAdminData();

  // Active highlighted section state
  const [selectedSection, setSelectedSection] = useState('heroBanner');
  // Sub-tab inside edit panel (Content, Images, Settings, Advanced)
  const [activeSubTab, setActiveSubTab] = useState('content');

  // Temp local state for selected section to support save/discard flow
  const [localSectionData, setLocalSectionData] = useState({ ...cmsData[selectedSection] });

  // If selection changes, sync local state
  React.useEffect(() => {
    setLocalSectionData({ ...cmsData[selectedSection] });
    if (selectedSection === 'announcementBar') {
      setActiveSubTab('content');
    }
  }, [selectedSection, cmsData]);

  // Toast alert
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preview Modal overlay
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Section list metadata
  const sectionsList = [
    { key: 'announcementBar', name: '1. Announcement Bar', icon: <FiVolume2 /> },
    { key: 'heroBanner', name: '2. Hero Banner', icon: <FiImage /> },
    { key: 'shopByOccasion', name: '3. Shop by Occasion', icon: <FiGift /> },
    { key: 'newArrivals', name: '4. New Arrivals', icon: <FiStar /> },
    { key: 'featuredCollection', name: '5. Featured Collection', icon: <FiHeart /> },
    { key: 'bestSellers', name: '6. Best Sellers', icon: <FiAward /> },
    { key: 'shopByFabric', name: '7. Shop by Fabric', icon: <FiGrid /> },
    { key: 'whyHappySarees', name: '8. Why Happy Sarees', icon: <FiCheckSquare /> },
    { key: 'customerReviews', name: '9. Customer Reviews', icon: <FiSmile /> },
    { key: 'watchAndBuy', name: '10. Watch & Buy', icon: <FiPlayCircle /> },
    { key: 'newsletter', name: '11. Newsletter', icon: <FiMail /> },
    { key: 'footer', name: '12. Footer', icon: <FiLayout /> }
  ];

  // Handle local text inputs
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setLocalSectionData(prev => ({ ...prev, [name]: finalVal }));
  };

  // Save current highlighted section changes to database & state
  const handleSaveSection = () => {
    if (updateCmsSection) {
      updateCmsSection(selectedSection, localSectionData);
    } else {
      setCmsData(prev => ({
        ...prev,
        [selectedSection]: { ...localSectionData }
      }));
    }
    triggerToast(`Changes saved for ${sectionsList.find(s => s.key === selectedSection)?.name.substring(3)}.`);
  };

  // Global reset to factory settings
  const handleResetAll = () => {
    if (window.confirm("Are you sure you want to restore all sections back to default curation? All custom headings and banners will be reset.")) {
      localStorage.removeItem('hs_admin_cms_data');
      window.location.reload();
    }
  };

  // Handle local file upload converting to base64
  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalSectionData(prev => ({
        ...prev,
        [fieldName]: reader.result
      }));
      triggerToast("Banner updated.");
    };
    reader.readAsDataURL(file);
  };

  // Quick helper to render icons
  const getSectionIcon = (key) => {
    return sectionsList.find(s => s.key === key)?.icon;
  };

  return (
    <div className={styles.wrapper}>
      {toastMessage && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMessage}
        </div>
      )}

      {/* Preview Full Homepage Mockup Modal Overlay */}
      {showPreviewModal && (
        <div className={styles.previewModalOverlay}>
          <div className={styles.previewModal}>
            <div className={styles.previewModalHeader}>
              <h2>Storefront Live Curation Preview</h2>
              <button className={styles.closeModalBtn} onClick={() => setShowPreviewModal(false)}><FiX /></button>
            </div>
            
            <div className={styles.previewModalScrollBody}>
              {/* Renders each section dynamically if enabled */}
              
              {/* 1. Announcement Bar */}
              {cmsData.announcementBar.enabled && (
                <div 
                  style={{
                    backgroundColor: cmsData.announcementBar.backgroundColor,
                    color: cmsData.announcementBar.textColor,
                    textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: 'bold'
                  }}
                >
                  {cmsData.announcementBar.text}
                </div>
              )}

              {/* 2. Hero Banner */}
              {cmsData.heroBanner.enabled && (
                <div 
                  style={{
                    height: '350px',
                    backgroundImage: `url(${cmsData.heroBanner.desktopImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--bg-white)',
                    textAlign: 'center',
                    padding: '20px',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1 }} />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <p style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '2px', color: 'var(--gold-color)', marginBottom: '8px', fontWeight: 700 }}>
                      {cmsData.heroBanner.subHeading}
                    </p>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'var(--bg-white)', marginBottom: '12px' }}>
                      {cmsData.heroBanner.heading}
                    </h1>
                    <p style={{ fontSize: '13px', maxWidth: '500px', margin: '0 auto 20px auto', opacity: 0.9 }}>
                      {cmsData.heroBanner.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button style={{ padding: '8px 18px', backgroundColor: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>
                        {cmsData.heroBanner.primaryBtnText}
                      </button>
                      <button style={{ padding: '8px 18px', backgroundColor: 'transparent', color: 'var(--bg-white)', border: '1px solid var(--bg-white)', borderRadius: '4px', fontWeight: 600, fontSize: '12px' }}>
                        {cmsData.heroBanner.secondaryBtnText}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Shop by Occasion */}
              {cmsData.shopByOccasion.enabled && (
                <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--bg-soft-cream)' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '4px' }}>
                    {cmsData.shopByOccasion.title}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>
                    {cmsData.shopByOccasion.subtitle}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    {cmsData.shopByOccasion.selectedOccasions?.slice(0, cmsData.shopByOccasion.displayCount).map((occ, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--bg-white)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(43, 18, 32, 0.05)', fontWeight: 600, fontSize: '13px' }}>
                        🎉 {occ}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. New Arrivals */}
              {cmsData.newArrivals.enabled && (
                <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--bg-white)' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '20px' }}>
                    New Arrivals
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    {products.slice(0, cmsData.newArrivals.displayCount).map((p) => (
                      <div key={p.id} style={{ textAlign: 'left', border: '1px solid rgba(43, 18, 32, 0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                        <div style={{ padding: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600 }}>{p.fabric}</span>
                          <h4 style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>{p.name}</h4>
                          <strong style={{ fontSize: '12px', color: 'var(--primary-color)' }}>₹{p.price}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Featured Collection */}
              {cmsData.featuredCollection.enabled && (
                <div 
                  style={{
                    height: '240px',
                    backgroundImage: `url(${cmsData.featuredCollection.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--bg-white)',
                    position: 'relative',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 1 }} />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', marginBottom: '6px' }}>{cmsData.featuredCollection.title}</h2>
                    <p style={{ fontSize: '12px', opacity: 0.9, marginBottom: '16px' }}>{cmsData.featuredCollection.subtitle}</p>
                    <button style={{ padding: '6px 14px', backgroundColor: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                      {cmsData.featuredCollection.btnText}
                    </button>
                  </div>
                </div>
              )}

              {/* 6. Best Sellers */}
              {cmsData.bestSellers.enabled && (
                <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--bg-soft-cream)' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '20px' }}>
                    Bestsellers
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    {products.slice(0, cmsData.bestSellers.displayCount).map((p) => (
                      <div key={p.id} style={{ textAlign: 'left', border: '1px solid rgba(43, 18, 32, 0.05)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-white)' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                        <div style={{ padding: '10px' }}>
                          <span style={{ fontSize: '11px', color: 'var(--primary-color)', fontWeight: 600 }}>{p.fabric}</span>
                          <h4 style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '4px 0' }}>{p.name}</h4>
                          <strong style={{ fontSize: '12px', color: 'var(--primary-color)' }}>₹{p.price}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Shop by Fabric */}
              {cmsData.shopByFabric.enabled && (
                <div style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: 'var(--bg-white)' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '20px' }}>
                    Shop By Fabric
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {cmsData.shopByFabric.selectedFabrics?.slice(0, cmsData.shopByFabric.displayCount).map((fab, i) => (
                      <div key={i} style={{ padding: '8px 20px', backgroundColor: 'rgba(209,27,105,0.06)', color: 'var(--primary-color)', fontWeight: 700, borderRadius: '20px', fontSize: '12px' }}>
                        {fab}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Why Happy Sarees */}
              {cmsData.whyHappySarees.enabled && (
                <div style={{ padding: '30px 20px', backgroundColor: 'var(--bg-soft-cream)', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '20px' }}>
                    Why Shop With Us
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    {cmsData.whyHappySarees.cards?.map((card, i) => (
                      <div key={i} style={{ backgroundColor: 'var(--bg-white)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(43, 18, 32, 0.04)' }}>
                        <span style={{ fontSize: '22px', color: 'var(--primary-color)' }}>💎</span>
                        <h4 style={{ fontSize: '13px', margin: '8px 0 4px 0', fontWeight: 'bold' }}>{card.title}</h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. Reviews */}
              {cmsData.customerReviews.enabled && (
                <div style={{ padding: '30px 20px', backgroundColor: 'var(--bg-white)', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '20px' }}>
                    Customer Reviews
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
                    {cmsData.customerReviews.selectedReviews?.slice(0, cmsData.customerReviews.reviewCount).map((rev, i) => (
                      <div key={i} style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid rgba(43, 18, 32, 0.05)', textAlign: 'left' }}>
                        <div style={{ color: '#ffb300', marginBottom: '6px' }}>⭐⭐⭐⭐⭐</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.4 }}>"{rev.comment}"</p>
                        <h5 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-color)' }}>- {rev.reviewer}</h5>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. Watch & Buy */}
              {cmsData.watchAndBuy.enabled && (
                <div style={{ padding: '30px 20px', backgroundColor: 'var(--bg-soft-cream)', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-color)', fontSize: '20px', marginBottom: '4px' }}>
                    Watch &amp; Buy
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>{cmsData.watchAndBuy.title}</p>
                  <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    <video src={cmsData.watchAndBuy.videoUrl} poster={cmsData.watchAndBuy.thumbnail} controls style={{ width: '100%', height: '220px', display: 'block', objectFit: 'cover' }} />
                  </div>
                </div>
              )}

              {/* 11. Newsletter */}
              {cmsData.newsletter.enabled && (
                <div style={{ padding: '30px 20px', backgroundColor: 'var(--text-color)', color: 'var(--bg-white)', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', marginBottom: '6px', color: 'var(--bg-white)' }}>{cmsData.newsletter.heading}</h2>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '16px', maxWidth: '450px', margin: '0 auto 16px auto' }}>{cmsData.newsletter.description}</p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', maxWidth: '380px', margin: '0 auto' }}>
                    <input type="text" placeholder={cmsData.newsletter.placeholder} style={{ flex: 1, padding: '8px 12px', border: 'none', borderRadius: '4px', fontSize: '12px' }} disabled />
                    <button style={{ padding: '8px 14px', backgroundColor: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                      {cmsData.newsletter.btnText}
                    </button>
                  </div>
                </div>
              )}

              {/* 12. Footer */}
              {cmsData.footer.enabled && (
                <div style={{ padding: '24px 20px', backgroundColor: '#1a1a1a', color: 'var(--text-light)', fontSize: '11px', textAlign: 'center', borderTop: '1px solid #333' }}>
                  <p style={{ marginBottom: '10px' }}>{cmsData.footer.copyright}</p>
                  <p>Policies: {cmsData.footer.policies?.map(p => p.label).join(' | ')}</p>
                </div>
              )}

            </div>
            
            <div className={styles.previewModalFooter}>
              <button className={styles.publishBtn} onClick={() => setShowPreviewModal(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Main split grid layout */}
      <div className={styles.cmsGrid}>
        
        {/* Left Side: Cards grid representing homepage sections */}
        <div className={styles.leftColumn}>
          <div className={styles.sectionsCardGrid}>
            {sectionsList.map((sec) => {
              const currentData = cmsData[sec.key] || {};
              const isSelected = selectedSection === sec.key;
              return (
                <div 
                  key={sec.key} 
                  className={`${styles.sectionBlockCard} ${isSelected ? styles.cardActiveHighlight : ''}`}
                  onClick={() => setSelectedSection(sec.key)}
                >
                  <div className={styles.sectionCardHeader}>
                    <div className={styles.cardInfoLeft}>
                      <span className={styles.cardIcon}>{sec.icon}</span>
                      <span className={styles.cardName}>{sec.name}</span>
                    </div>
                    {currentData.enabled ? (
                      <span className={styles.statusActivePill}>Enabled</span>
                    ) : (
                      <span className={styles.statusInactivePill}>Disabled</span>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <label>Display Order</label>
                    <input
                      type="number"
                      value={currentData.displayOrder || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCmsData(prev => ({
                          ...prev,
                          [sec.key]: { ...prev[sec.key], displayOrder: val }
                        }));
                      }}
                      onClick={(e) => e.stopPropagation()} // don't highlight right panel on input click
                      className={styles.orderInputBox}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Tabbed sub-form panel for the active section */}
        <div className={styles.rightColumn}>
          <div className={styles.editSectionCard}>
            
            <div className={styles.editCardHeader}>
              <div>
                <h3>Edit Section: {sectionsList.find(s => s.key === selectedSection)?.name.substring(3)}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>Customize layout text and images</p>
              </div>

              {/* Status toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {localSectionData.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className={styles.switchLabel}>
                  <input 
                    type="checkbox" 
                    name="enabled"
                    checked={localSectionData.enabled || false}
                    onChange={handleFieldChange} 
                  />
                  <span className={styles.switchSlider} />
                </label>
                <button className={styles.actionSaveBtn} onClick={handleSaveSection}>
                  Save Changes
                </button>
              </div>
            </div>

            {/* Inner sub-tabs headers */}
            {selectedSection !== 'announcementBar' && (
              <div className={styles.subTabHeaders}>
                <button 
                  className={`${styles.subTabBtn} ${activeSubTab === 'content' ? styles.subTabActive : ''}`}
                  onClick={() => setActiveSubTab('content')}
                >
                  Content
                </button>
                <button 
                  className={`${styles.subTabBtn} ${activeSubTab === 'media' ? styles.subTabActive : ''}`}
                  onClick={() => setActiveSubTab('media')}
                >
                  Media / Images
                </button>
                <button 
                  className={`${styles.subTabBtn} ${activeSubTab === 'settings' ? styles.subTabActive : ''}`}
                  onClick={() => setActiveSubTab('settings')}
                >
                  Settings
                </button>
              </div>
            )}

            {/* Form details based on highlighted tab */}
            <div className={styles.editFormBody}>
              
              {/* Tab: CONTENT */}
              {activeSubTab === 'content' && (
                <div className={styles.formPanel}>
                  
                  {/* HERO BANNER SECTION FIELDS */}
                  {selectedSection === 'heroBanner' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Main Heading</label>
                        <input type="text" name="heading" value={localSectionData.heading || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Sub Heading</label>
                        <input type="text" name="subHeading" value={localSectionData.subHeading || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Description</label>
                        <textarea name="description" value={localSectionData.description || ''} onChange={handleFieldChange} rows={3} />
                      </div>
                      <div className={styles.fieldDoubleRow}>
                        <div>
                          <label>Primary Button Text</label>
                          <input type="text" name="primaryBtnText" value={localSectionData.primaryBtnText || ''} onChange={handleFieldChange} />
                        </div>
                        <div>
                          <label>Primary Button Link</label>
                          <input type="text" name="primaryBtnLink" value={localSectionData.primaryBtnLink || ''} onChange={handleFieldChange} />
                        </div>
                      </div>
                      <div className={styles.fieldDoubleRow}>
                        <div>
                          <label>Secondary Button Text</label>
                          <input type="text" name="secondaryBtnText" value={localSectionData.secondaryBtnText || ''} onChange={handleFieldChange} />
                        </div>
                        <div>
                          <label>Secondary Button Link</label>
                          <input type="text" name="secondaryBtnLink" value={localSectionData.secondaryBtnLink || ''} onChange={handleFieldChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ANNOUNCEMENT BAR SECTION FIELDS */}
                  {selectedSection === 'announcementBar' && (
                    <AnnouncementManager 
                      sectionData={localSectionData}
                      onUpdate={(nextData) => setLocalSectionData(nextData)}
                      onSave={(nextData) => {
                        if (updateCmsSection) {
                          updateCmsSection('announcementBar', nextData);
                        }
                      }}
                    />
                  )}

                  {/* SHOP BY OCCASION SECTION FIELDS */}
                  {selectedSection === 'shopByOccasion' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Title</label>
                        <input type="text" name="title" value={localSectionData.title || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Subtitle / Tagline</label>
                        <input type="text" name="subtitle" value={localSectionData.subtitle || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Select Highlights</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {masterData.occasions?.map(occ => {
                            const isSel = localSectionData.selectedOccasions?.includes(occ.name);
                            return (
                              <button
                                key={occ.id}
                                type="button"
                                className={isSel ? styles.selectPillActive : styles.selectPill}
                                onClick={() => {
                                  const list = localSectionData.selectedOccasions || [];
                                  const nextList = isSel ? list.filter(x => x !== occ.name) : [...list, occ.name];
                                  setLocalSectionData({ ...localSectionData, selectedOccasions: nextList });
                                }}
                              >
                                {occ.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NEW ARRIVALS */}
                  {selectedSection === 'newArrivals' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Selection Mode</label>
                        <select name="selectionMode" value={localSectionData.selectionMode || 'auto'} onChange={handleFieldChange}>
                          <option value="auto">Auto Fetch Latest Products</option>
                          <option value="manual">Manual Selection</option>
                        </select>
                      </div>
                      {localSectionData.selectionMode === 'manual' && (
                        <div className={styles.fieldRow}>
                          <label>Select Saree Products</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {products.map(p => {
                              const isSel = localSectionData.selectedProducts?.includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  className={isSel ? styles.selectPillActive : styles.selectPill}
                                  onClick={() => {
                                    const list = localSectionData.selectedProducts || [];
                                    const nextList = isSel ? list.filter(x => x !== p.id) : [...list, p.id];
                                    setLocalSectionData({ ...localSectionData, selectedProducts: nextList });
                                  }}
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FEATURED COLLECTION */}
                  {selectedSection === 'featuredCollection' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Featured Collection Title</label>
                        <input type="text" name="title" value={localSectionData.title || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Subtitle Curation description</label>
                        <input type="text" name="subtitle" value={localSectionData.subtitle || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldDoubleRow}>
                        <div>
                          <label>Button Label</label>
                          <input type="text" name="btnText" value={localSectionData.btnText || ''} onChange={handleFieldChange} />
                        </div>
                        <div>
                          <label>Button Link Target</label>
                          <input type="text" name="btnLink" value={localSectionData.btnLink || ''} onChange={handleFieldChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BEST SELLERS */}
                  {selectedSection === 'bestSellers' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Selection Mode</label>
                        <select name="selectionMode" value={localSectionData.selectionMode || 'auto'} onChange={handleFieldChange}>
                          <option value="auto">Auto Fetch</option>
                          <option value="manual">Manual Product Selection</option>
                        </select>
                      </div>
                      {localSectionData.selectionMode === 'manual' && (
                        <div className={styles.fieldRow}>
                          <label>Select Saree Products</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {products.map(p => {
                              const isSel = localSectionData.selectedProducts?.includes(p.id);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  className={isSel ? styles.selectPillActive : styles.selectPill}
                                  onClick={() => {
                                    const list = localSectionData.selectedProducts || [];
                                    const nextList = isSel ? list.filter(x => x !== p.id) : [...list, p.id];
                                    setLocalSectionData({ ...localSectionData, selectedProducts: nextList });
                                  }}
                                >
                                  {p.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SHOP BY FABRIC */}
                  {selectedSection === 'shopByFabric' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Select Fabrics Highlighted</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {masterData.fabrics?.map(fab => {
                            const isSel = localSectionData.selectedFabrics?.includes(fab.name);
                            return (
                              <button
                                key={fab.id}
                                type="button"
                                className={isSel ? styles.selectPillActive : styles.selectPill}
                                onClick={() => {
                                  const list = localSectionData.selectedFabrics || [];
                                  const nextList = isSel ? list.filter(x => x !== fab.name) : [...list, fab.name];
                                  setLocalSectionData({ ...localSectionData, selectedFabrics: nextList });
                                }}
                              >
                                {fab.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WHY HAPPY SAREES */}
                  {selectedSection === 'whyHappySarees' && (
                    <div className={styles.cmsFormGroup}>
                      <h4 style={{ marginBottom: '14px', fontSize: '13px' }}>Feature Cards Curation</h4>
                      {localSectionData.cards?.map((card, idx) => (
                        <div key={idx} className={styles.curationCardSubPanel}>
                          <h5>Card {idx + 1}</h5>
                          <div className={styles.fieldDoubleRow}>
                            <div>
                              <label>Title</label>
                              <input 
                                type="text" 
                                value={card.title} 
                                onChange={(e) => {
                                  const nextCards = [...localSectionData.cards];
                                  nextCards[idx].title = e.target.value;
                                  setLocalSectionData({ ...localSectionData, cards: nextCards });
                                }} 
                              />
                            </div>
                            <div>
                              <label>Icon Identifier</label>
                              <input 
                                type="text" 
                                value={card.icon} 
                                onChange={(e) => {
                                  const nextCards = [...localSectionData.cards];
                                  nextCards[idx].icon = e.target.value;
                                  setLocalSectionData({ ...localSectionData, cards: nextCards });
                                }} 
                              />
                            </div>
                          </div>
                          <div className={styles.fieldRow}>
                            <label>Description details</label>
                            <input 
                              type="text" 
                              value={card.description} 
                              onChange={(e) => {
                                const nextCards = [...localSectionData.cards];
                                nextCards[idx].description = e.target.value;
                                setLocalSectionData({ ...localSectionData, cards: nextCards });
                              }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CUSTOMER REVIEWS */}
                  {selectedSection === 'customerReviews' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Review Selection Mode</label>
                        <select name="selectionMode" value={localSectionData.selectionMode || 'auto'} onChange={handleFieldChange}>
                          <option value="auto">Auto Fetch Reviews</option>
                          <option value="manual">Manual Selection</option>
                        </select>
                      </div>
                      {localSectionData.selectedReviews?.map((rev, idx) => (
                        <div key={idx} className={styles.curationCardSubPanel}>
                          <h5>Review {idx + 1}</h5>
                          <div className={styles.fieldDoubleRow}>
                            <div>
                              <label>Reviewer Name</label>
                              <input 
                                type="text" 
                                value={rev.reviewer} 
                                onChange={(e) => {
                                  const nextRevs = [...localSectionData.selectedReviews];
                                  nextRevs[idx].reviewer = e.target.value;
                                  setLocalSectionData({ ...localSectionData, selectedReviews: nextRevs });
                                }} 
                              />
                            </div>
                            <div>
                              <label>Rating Stars</label>
                              <input 
                                type="number" 
                                value={rev.rating} 
                                onChange={(e) => {
                                  const nextRevs = [...localSectionData.selectedReviews];
                                  nextRevs[idx].rating = Number(e.target.value);
                                  setLocalSectionData({ ...localSectionData, selectedReviews: nextRevs });
                                }} 
                              />
                            </div>
                          </div>
                          <div className={styles.fieldRow}>
                            <label>Comment text</label>
                            <textarea 
                              value={rev.comment} 
                              onChange={(e) => {
                                const nextRevs = [...localSectionData.selectedReviews];
                                nextRevs[idx].comment = e.target.value;
                                setLocalSectionData({ ...localSectionData, selectedReviews: nextRevs });
                              }} 
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WATCH & BUY */}
                  {selectedSection === 'watchAndBuy' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Video Title Description</label>
                        <input type="text" name="title" value={localSectionData.title || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Video Source URL (MP4)</label>
                        <input type="text" name="videoUrl" value={localSectionData.videoUrl || ''} onChange={handleFieldChange} />
                      </div>
                    </div>
                  )}

                  {/* NEWSLETTER */}
                  {selectedSection === 'newsletter' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Heading</label>
                        <input type="text" name="heading" value={localSectionData.heading || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldRow}>
                        <label>Teaser description</label>
                        <input type="text" name="description" value={localSectionData.description || ''} onChange={handleFieldChange} />
                      </div>
                      <div className={styles.fieldDoubleRow}>
                        <div>
                          <label>Input Placeholder</label>
                          <input type="text" name="placeholder" value={localSectionData.placeholder || ''} onChange={handleFieldChange} />
                        </div>
                        <div>
                          <label>Button Label Text</label>
                          <input type="text" name="btnText" value={localSectionData.btnText || ''} onChange={handleFieldChange} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FOOTER */}
                  {selectedSection === 'footer' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.fieldRow}>
                        <label>Copyright text</label>
                        <input type="text" name="copyright" value={localSectionData.copyright || ''} onChange={handleFieldChange} />
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Tab: IMAGES */}
              {activeSubTab === 'media' && (
                <div className={styles.formPanel}>
                  {/* Hero banner image uploads */}
                  {selectedSection === 'heroBanner' && (
                    <div className={styles.cmsFormGroup}>
                      <div className={styles.uploaderBoxRow}>
                        <div>
                          <label>Desktop Banner Image</label>
                          <div className={styles.smallUploadCard} onClick={() => document.getElementById('hero-desktop-upload').click()}>
                            <FiUpload />
                            <span>Change Desktop Image</span>
                            <input 
                              id="hero-desktop-upload"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(e, 'desktopImage')}
                            />
                          </div>
                        </div>

                        <div>
                          <label>Mobile Banner Image</label>
                          <div className={styles.smallUploadCard} onClick={() => document.getElementById('hero-mobile-upload').click()}>
                            <FiUpload />
                            <span>Change Mobile Image</span>
                            <input 
                              id="hero-mobile-upload"
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(e, 'mobileImage')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Display previews inside the tab */}
                      <div style={{ marginTop: '16px' }}>
                        <label>Desktop Banner Preview</label>
                        <div style={{ width: '100%', height: '140px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '6px' }}>
                          <img src={localSectionData.desktopImage} alt="Desktop Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Collection image upload */}
                  {selectedSection === 'featuredCollection' && (
                    <div className={styles.cmsFormGroup}>
                      <label>Upload Background Image</label>
                      <div className={styles.smallUploadCard} onClick={() => document.getElementById('featured-bg-upload').click()}>
                        <FiUpload />
                        <span>Upload Background</span>
                        <input 
                          id="featured-bg-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                        />
                      </div>
                      <div style={{ width: '100%', height: '140px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '14px' }}>
                        <img src={localSectionData.backgroundImage} alt="BG Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}

                  {/* Watch & Buy video thumbnail upload */}
                  {selectedSection === 'watchAndBuy' && (
                    <div className={styles.cmsFormGroup}>
                      <label>Upload Video Poster Cover Thumbnail</label>
                      <div className={styles.smallUploadCard} onClick={() => document.getElementById('video-thumb-upload').click()}>
                        <FiUpload />
                        <span>Upload Video Cover</span>
                        <input 
                          id="video-thumb-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleImageUpload(e, 'thumbnail')}
                        />
                      </div>
                      <div style={{ width: '120px', height: '120px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: '14px' }}>
                        <img src={localSectionData.thumbnail} alt="Poster Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  )}

                  {/* Fallback for other sections that do not have custom media */}
                  {selectedSection !== 'heroBanner' && selectedSection !== 'featuredCollection' && selectedSection !== 'watchAndBuy' && (
                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                      No media uploads required for this section.
                    </div>
                  )}
                </div>
              )}

              {/* Tab: SETTINGS */}
              {activeSubTab === 'settings' && (
                <div className={styles.formPanel}>
                  <div className={styles.cmsFormGroup}>
                    <div className={styles.fieldRow}>
                      <label>Curation Display Count (Max items to display)</label>
                      <input 
                        type="number" 
                        name="displayCount" 
                        value={localSectionData.displayCount || ''} 
                        onChange={handleFieldChange} 
                        placeholder="e.g. 4"
                      />
                    </div>
                    <div className={styles.fieldRow}>
                      <label>Section Display Ordering Index</label>
                      <input 
                        type="number" 
                        name="displayOrder" 
                        value={localSectionData.displayOrder || ''} 
                        onChange={handleFieldChange} 
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Collapsible Local preview block */}
            <div className={styles.localPreviewCollapseCard}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-color)' }}>
                Section Curation Mockup
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '10px' }}>
                How this section will render with current unsaved form fields.
              </p>
              
              <div className={styles.localPreviewBoxFrame}>
                {selectedSection === 'announcementBar' && (
                  <div style={{ backgroundColor: localSectionData.backgroundColor, color: localSectionData.textColor, padding: '10px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                    📢 {localSectionData.text || 'Teaser text here...'}
                  </div>
                )}
                {selectedSection === 'heroBanner' && (
                  <div style={{ padding: '20px', backgroundColor: '#fafafa', border: '1px dashed #ccc', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '18px', color: 'var(--primary-color)', fontFamily: 'Playfair Display, serif' }}>{localSectionData.heading}</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{localSectionData.subHeading}</p>
                    <button style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '4px', fontSize: '11px' }}>{localSectionData.primaryBtnText}</button>
                  </div>
                )}
                {selectedSection !== 'announcementBar' && selectedSection !== 'heroBanner' && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                    Section "{sectionsList.find(s => s.key === selectedSection)?.name.substring(3)}" is enabled: {localSectionData.enabled ? 'YES' : 'NO'}. Check full emulator preview.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Floating Bottom Save Bar */}
      <div className={styles.floatingSaveBar}>
        <button className={styles.previewHomeBtn} onClick={() => setShowPreviewModal(true)}>
          <FiEye /> Preview Homepage
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className={styles.resetAllBtn} onClick={handleResetAll}>
            <FiRefreshCw /> Reset All Sections
          </button>
          <button className={styles.globalSaveBtn} onClick={() => {
            if (updateCmsSection) {
              updateCmsSection(selectedSection, localSectionData);
            } else {
              setCmsData(prev => ({
                ...prev,
                [selectedSection]: { ...localSectionData }
              }));
            }
            triggerToast("All homepage configurations saved successfully to database!");
          }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomepageCMS;
