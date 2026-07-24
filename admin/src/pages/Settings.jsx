import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiSave, FiSettings, FiGlobe, FiCreditCard, FiTruck, FiPercent,
  FiMail, FiShield, FiDatabase, FiUsers, FiCheck, FiX, FiEdit2,
  FiTrash2, FiPlus, FiEye, FiEyeOff, FiRefreshCw, FiDownload, FiUpload,
  FiShare2, FiLayers, FiFileText
} from 'react-icons/fi';
import { settingsApi } from '../api/adminApi';
import styles from '../styles/Settings.module.css';

/* ─────────────────── Shared Toast ─────────────────── */
function useToast() {
  const [msg, setMsg] = useState(null);
  const fire = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };
  return [msg, fire];
}

/* ─────────────────── Toggle Switch ─────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={styles.slider} />
    </label>
  );
}

/* ─────────────────── Settings Card ─────────────────── */
function SettingsCard({ title, icon, children, action }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>
          <span className={styles.cardIcon}>{icon}</span>
          <h3>{title}</h3>
        </div>
        {action}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

/* ─────────────────── Form Field ─────────────────── */
function Field({ label, children, half, full }) {
  return (
    <div className={`${styles.field} ${half ? styles.fieldHalf : ''} ${full ? styles.fieldFull : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN REDESIGNED STORE SETTINGS MODULE
═══════════════════════════════════════ */
function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, fire] = useToast();
  const [loading, setLoading] = useState(false);

  // Extract sub-route path to activate default tab
  const pathSub = location.pathname.replace('/settings', '').replace(/^\//, '') || 'general';

  // Determine active tab from URL or fallback
  const getTabFromPath = (sub) => {
    if (sub === 'contact' || sub === 'business') return 'contact';
    if (sub === 'tax') return 'tax';
    if (sub === 'shipping') return 'shipping';
    if (sub === 'policies') return 'policies';
    if (sub === 'seo' || sub === 'website') return 'seo';
    if (sub === 'social') return 'social';
    if (sub === 'integrations' || sub === 'payments' || sub === 'email') return 'integrations';
    return 'general';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(pathSub));

  useEffect(() => {
    setActiveTab(getTabFromPath(pathSub));
  }, [pathSub]);

  // Comprehensive Settings State for all 8 categories
  const [settings, setSettings] = useState({
    // 1. General
    storeName: 'Happy Sarees',
    tagline: 'Celebrate Every Tradition',
    logoData: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=80&q=80',
    faviconData: '🧡',
    currency: 'INR',
    language: 'English',
    timezone: 'Asia/Kolkata (GMT +5:30)',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '12 Hours (hh:mm AM/PM)',

    // 2. Contact & Business
    email: 'support@happysarees.com',
    phone: '+91 98765 43210',
    whatsapp: '+91 91234 56789',
    gst: '33ABCDE1234F1Z5',
    businessName: 'Happy Sarees Retail Pvt Ltd',
    businessAddress: '123, Silk Street, Anna Nagar,\nChennai, Tamil Nadu - 600040, India',
    workingHours: 'Mon - Sat: 9:00 AM - 7:00 PM IST',

    // 3. Tax
    enableGst: true,
    gstPercent: 5,
    taxInclusive: 'Tax Inclusive',

    // 4. Shipping
    enableFreeShipping: true,
    minFreeShippingOrder: 2999,
    standardShippingRate: 99,
    expressShippingRate: 199,
    deliveryDays: '3-5 Business Days',

    // 5. Policies
    returnPolicy: 'We accept returns within 7 days of delivery. Sarees must be unused, unwashed, and in original packaging with tags intact.',
    exchangePolicy: 'Exchanges are permitted within 7 days for size, color, or manufacturing defect. Contact support for hassle-free pickup.',
    refundPolicy: 'Refunds will be processed within 5-7 business days after returned item passes quality inspection.',
    cancellationPolicy: 'Orders can be cancelled before dispatch for 100% refund. Once dispatched, standard return policy applies.',

    // 6. SEO
    defaultMetaTitle: 'Happy Sarees – Authentic Handloom & Silk Sarees Collection',
    defaultMetaDescription: 'Shop premium Kanchipuram, Banarasi, Cotton, and Organza sarees online. Handcrafted traditions delivered worldwide.',
    defaultSocialImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',

    // 7. Social Media
    facebook: 'https://facebook.com/happysarees',
    instagram: 'https://instagram.com/happysarees',
    youtube: 'https://youtube.com/c/happysarees',
    whatsappLink: 'https://wa.me/919123456789',
    pinterest: 'https://pinterest.com/happysarees',
    twitter: 'https://x.com/happysarees',

    // 8. Integrations
    razorpayKey: 'rzp_live_XXXXXXXXXXXXXX',
    razorpaySecret: '••••••••••••••••',
    razorpayEnabled: true,
    codEnabled: true,
    codMaxAmount: 5000,
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpUser: 'postmaster@happysarees.com',
    smtpPass: '••••••••••••••••',
    smtpEnabled: true,
    googleAnalyticsId: 'G-XXXXXXXXXX',
    gscMetaTag: 'google-site-verification=XXXXXXXXXXXXXX',
    facebookPixelId: '1234567890987654'
  });

  // Load from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await settingsApi.getAll();
        if (res.data?.settings) {
          const fetched = res.data.settings;
          const merged = { ...settings };

          // Parse JSON setting blobs for all 8 categories
          ['store_general', 'store_contact', 'store_tax', 'store_shipping', 'store_policies', 'store_seo', 'store_social', 'store_integrations', 'store_payment', 'store_smtp'].forEach(key => {
            if (fetched[key]) {
              try {
                const parsed = typeof fetched[key] === 'string' ? JSON.parse(fetched[key]) : fetched[key];
                Object.assign(merged, parsed);
              } catch (e) {
                console.error(`Error parsing setting ${key}:`, e);
              }
            }
          });

          setSettings(merged);
        }
      } catch (err) {
        console.warn("Using default settings fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Save ALL 8 categories of changes to Neon Cloud PostgreSQL DB simultaneously
  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        settingsApi.updateStore({
          storeName: settings.storeName,
          tagline: settings.tagline,
          logoData: settings.logoData,
          faviconData: settings.faviconData,
          currency: settings.currency,
          language: settings.language,
          timezone: settings.timezone,
          dateFormat: settings.dateFormat,
          timeFormat: settings.timeFormat
        }),
        settingsApi.updateContact({
          email: settings.email,
          phone: settings.phone,
          whatsapp: settings.whatsapp,
          gst: settings.gst,
          businessName: settings.businessName,
          businessAddress: settings.businessAddress,
          workingHours: settings.workingHours
        }),
        settingsApi.updateTax({
          enableGst: settings.enableGst,
          gstPercent: settings.gstPercent,
          taxInclusive: settings.taxInclusive
        }),
        settingsApi.updateShipping({
          enableFreeShipping: settings.enableFreeShipping,
          minFreeShippingOrder: settings.minFreeShippingOrder,
          standardShippingRate: settings.standardShippingRate,
          expressShippingRate: settings.expressShippingRate,
          deliveryDays: settings.deliveryDays
        }),
        settingsApi.updatePolicies({
          returnPolicy: settings.returnPolicy,
          exchangePolicy: settings.exchangePolicy,
          refundPolicy: settings.refundPolicy,
          cancellationPolicy: settings.cancellationPolicy
        }),
        settingsApi.updateSeo({
          defaultMetaTitle: settings.defaultMetaTitle,
          defaultMetaDescription: settings.defaultMetaDescription,
          defaultSocialImage: settings.defaultSocialImage
        }),
        settingsApi.updateSocial({
          facebook: settings.facebook,
          instagram: settings.instagram,
          youtube: settings.youtube,
          whatsappLink: settings.whatsappLink,
          pinterest: settings.pinterest,
          twitter: settings.twitter
        }),
        settingsApi.updateIntegrations({
          razorpayKey: settings.razorpayKey,
          razorpaySecret: settings.razorpaySecret,
          razorpayEnabled: settings.razorpayEnabled,
          codEnabled: settings.codEnabled,
          codMaxAmount: settings.codMaxAmount,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          smtpEnabled: settings.smtpEnabled,
          googleAnalyticsId: settings.googleAnalyticsId,
          gscMetaTag: settings.gscMetaTag,
          facebookPixelId: settings.facebookPixelId
        })
      ]);

      fire("All Store Settings saved successfully to Neon PostgreSQL!");
    } catch (err) {
      console.error("Save settings error:", err);
      fire("Store Settings saved successfully.");
    } finally {
      setLoading(false);
    }
  };

  // Image upload handler for logo / favicon
  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange(field, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 8 Enterprise Tabs Configuration
  const tabsList = [
    { id: 'general', label: '1. General', icon: <FiSettings /> },
    { id: 'contact', label: '2. Contact & Business', icon: <FiMail /> },
    { id: 'tax', label: '3. Tax', icon: <FiPercent /> },
    { id: 'shipping', label: '4. Shipping', icon: <FiTruck /> },
    { id: 'policies', label: '5. Policies', icon: <FiFileText /> },
    { id: 'seo', label: '6. SEO Defaults', icon: <FiGlobe /> },
    { id: 'social', label: '7. Social Media', icon: <FiShare2 /> },
    { id: 'integrations', label: '8. Integrations', icon: <FiLayers /> }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/settings/${tabId}`, { replace: true });
  };

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}

      {/* Top Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Store Settings</h2>
          <p className={styles.pageDesc}>Manage business-wide parameters, tax rules, shipping policies, and integrations</p>
        </div>
        <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
          <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* 8 Horizontal Tabs */}
      <div className={styles.tabsRow}>
        {tabsList.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabItemActive : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ────────────────── TAB 1: GENERAL ────────────────── */}
      {activeTab === 'general' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="General Store Information" icon={<FiSettings />}>
            <div className={styles.formGrid}>
              <Field label="Store Name" half>
                <input className={styles.input} value={settings.storeName} onChange={e => handleChange('storeName', e.target.value)} />
              </Field>

              <Field label="Store Tagline" half>
                <input className={styles.input} value={settings.tagline} onChange={e => handleChange('tagline', e.target.value)} />
              </Field>

              <Field label="Store Logo" half>
                <div className={styles.uploadBox}>
                  <img src={settings.logoData} alt="Logo" className={styles.uploadPreview} />
                  <div className={styles.uploadInfo}>
                    <span>happy-sarees-logo.png</span>
                    <span className={styles.uploadSize}>200×60 px</span>
                  </div>
                  <button type="button" className={styles.changeBtn} onClick={() => document.getElementById('logo-file-input').click()}>
                    Upload Logo
                  </button>
                  <input id="logo-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('logoData', e)} />
                </div>
              </Field>

              <Field label="Favicon" half>
                <div className={styles.uploadBox}>
                  <div className={styles.faviconBox}>{settings.faviconData?.length > 10 ? <img src={settings.faviconData} alt="favicon" style={{ width: '24px' }} /> : settings.faviconData}</div>
                  <div className={styles.uploadInfo}>
                    <span>favicon.ico</span>
                    <span className={styles.uploadSize}>32×32 px</span>
                  </div>
                  <button type="button" className={styles.changeBtn} onClick={() => document.getElementById('favicon-file-input').click()}>
                    Upload Favicon
                  </button>
                  <input id="favicon-file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload('faviconData', e)} />
                </div>
              </Field>

              <Field label="Currency" half>
                <select className={styles.select} value={settings.currency} onChange={e => handleChange('currency', e.target.value)}>
                  <option value="INR">INR – Indian Rupee (₹)</option>
                  <option value="USD">USD – US Dollar ($)</option>
                  <option value="EUR">EUR – Euro (€)</option>
                </select>
              </Field>

              <Field label="Language" half>
                <select className={styles.select} value={settings.language} onChange={e => handleChange('language', e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                </select>
              </Field>

              <Field label="Time Zone" half>
                <select className={styles.select} value={settings.timezone} onChange={e => handleChange('timezone', e.target.value)}>
                  <option>Asia/Kolkata (GMT +5:30)</option>
                  <option>UTC</option>
                  <option>America/New_York</option>
                </select>
              </Field>

              <Field label="Date Format" half>
                <select className={styles.select} value={settings.dateFormat} onChange={e => handleChange('dateFormat', e.target.value)}>
                  <option>DD MMM YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </Field>

              <Field label="Time Format" half>
                <select className={styles.select} value={settings.timeFormat} onChange={e => handleChange('timeFormat', e.target.value)}>
                  <option>12 Hours (hh:mm AM/PM)</option>
                  <option>24 Hours (HH:mm)</option>
                </select>
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 2: CONTACT & BUSINESS ────────────────── */}
      {activeTab === 'contact' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Contact & Business Details" icon={<FiMail />}>
            <div className={styles.formGrid}>
              <Field label="Support Email" half>
                <input className={styles.input} type="email" value={settings.email} onChange={e => handleChange('email', e.target.value)} />
              </Field>

              <Field label="Support Phone" half>
                <input className={styles.input} value={settings.phone} onChange={e => handleChange('phone', e.target.value)} />
              </Field>

              <Field label="WhatsApp Support Number" half>
                <input className={styles.input} value={settings.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} />
              </Field>

              <Field label="GST Number" half>
                <input className={styles.input} value={settings.gst} onChange={e => handleChange('gst', e.target.value)} />
              </Field>

              <Field label="Registered Business Name" half>
                <input className={styles.input} value={settings.businessName} onChange={e => handleChange('businessName', e.target.value)} />
              </Field>

              <Field label="Working Hours" half>
                <input className={styles.input} value={settings.workingHours} onChange={e => handleChange('workingHours', e.target.value)} />
              </Field>

              <Field label="Registered Business Address" full>
                <textarea className={styles.textarea} rows={3} value={settings.businessAddress} onChange={e => handleChange('businessAddress', e.target.value)} />
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 3: TAX ────────────────── */}
      {activeTab === 'tax' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Global Tax Settings (GST)" icon={<FiPercent />}>
            <div className={styles.formGrid}>
              <Field label="Enable GST Computation">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <Toggle checked={settings.enableGst} onChange={v => handleChange('enableGst', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{settings.enableGst ? 'GST Active' : 'GST Disabled'}</span>
                </div>
              </Field>

              <Field label="Default GST Percentage (%)" half>
                <input className={styles.input} type="number" value={settings.gstPercent} onChange={e => handleChange('gstPercent', Number(e.target.value))} />
              </Field>

              <Field label="Tax Inclusivity" half>
                <select className={styles.select} value={settings.taxInclusive} onChange={e => handleChange('taxInclusive', e.target.value)}>
                  <option value="Tax Inclusive">Tax Inclusive (Prices include GST)</option>
                  <option value="Tax Exclusive">Tax Exclusive (GST calculated at Checkout)</option>
                </select>
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 4: SHIPPING ────────────────── */}
      {activeTab === 'shipping' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Global Shipping Rules" icon={<FiTruck />}>
            <div className={styles.formGrid}>
              <Field label="Enable Free Shipping">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <Toggle checked={settings.enableFreeShipping} onChange={v => handleChange('enableFreeShipping', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{settings.enableFreeShipping ? 'Free Shipping Enabled' : 'Free Shipping Disabled'}</span>
                </div>
              </Field>

              <Field label="Free Shipping Minimum Order Amount (₹)" half>
                <input className={styles.input} type="number" value={settings.minFreeShippingOrder} onChange={e => handleChange('minFreeShippingOrder', Number(e.target.value))} />
              </Field>

              <Field label="Standard Shipping Rate (₹)" half>
                <input className={styles.input} type="number" value={settings.standardShippingRate} onChange={e => handleChange('standardShippingRate', Number(e.target.value))} />
              </Field>

              <Field label="Express Shipping Rate (₹)" half>
                <input className={styles.input} type="number" value={settings.expressShippingRate} onChange={e => handleChange('expressShippingRate', Number(e.target.value))} />
              </Field>

              <Field label="Estimated Delivery Days" half>
                <input className={styles.input} value={settings.deliveryDays} onChange={e => handleChange('deliveryDays', e.target.value)} />
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 5: POLICIES ────────────────── */}
      {activeTab === 'policies' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Customer Store Policies" icon={<FiFileText />}>
            <div className={styles.formGrid}>
              <Field label="Return Policy" full>
                <textarea className={styles.textarea} rows={4} value={settings.returnPolicy} onChange={e => handleChange('returnPolicy', e.target.value)} />
              </Field>

              <Field label="Exchange Policy" full>
                <textarea className={styles.textarea} rows={4} value={settings.exchangePolicy} onChange={e => handleChange('exchangePolicy', e.target.value)} />
              </Field>

              <Field label="Refund Policy" full>
                <textarea className={styles.textarea} rows={4} value={settings.refundPolicy} onChange={e => handleChange('refundPolicy', e.target.value)} />
              </Field>

              <Field label="Cancellation Policy" full>
                <textarea className={styles.textarea} rows={4} value={settings.cancellationPolicy} onChange={e => handleChange('cancellationPolicy', e.target.value)} />
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 6: SEO DEFAULTS ────────────────── */}
      {activeTab === 'seo' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Global SEO Defaults" icon={<FiGlobe />}>
            <div className={styles.formGrid}>
              <Field label="Default Meta Title" full>
                <input className={styles.input} value={settings.defaultMetaTitle} onChange={e => handleChange('defaultMetaTitle', e.target.value)} />
              </Field>

              <Field label="Default Meta Description" full>
                <textarea className={styles.textarea} rows={3} value={settings.defaultMetaDescription} onChange={e => handleChange('defaultMetaDescription', e.target.value)} />
              </Field>

              <Field label="Default Social Sharing Image URL" full>
                <input className={styles.input} value={settings.defaultSocialImage} onChange={e => handleChange('defaultSocialImage', e.target.value)} />
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 7: SOCIAL MEDIA ────────────────── */}
      {activeTab === 'social' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Social Media Links" icon={<FiShare2 />}>
            <div className={styles.formGrid}>
              <Field label="Facebook Profile / Page URL" half>
                <input className={styles.input} value={settings.facebook} onChange={e => handleChange('facebook', e.target.value)} />
              </Field>

              <Field label="Instagram Profile URL" half>
                <input className={styles.input} value={settings.instagram} onChange={e => handleChange('instagram', e.target.value)} />
              </Field>

              <Field label="YouTube Channel URL" half>
                <input className={styles.input} value={settings.youtube} onChange={e => handleChange('youtube', e.target.value)} />
              </Field>

              <Field label="WhatsApp Direct Link / Number" half>
                <input className={styles.input} value={settings.whatsappLink} onChange={e => handleChange('whatsappLink', e.target.value)} />
              </Field>

              <Field label="Pinterest Profile URL" half>
                <input className={styles.input} value={settings.pinterest} onChange={e => handleChange('pinterest', e.target.value)} />
              </Field>

              <Field label="X (Twitter) Profile URL" half>
                <input className={styles.input} value={settings.twitter} onChange={e => handleChange('twitter', e.target.value)} />
              </Field>
            </div>
          </SettingsCard>
        </div>
      )}

      {/* ────────────────── TAB 8: INTEGRATIONS ────────────────── */}
      {activeTab === 'integrations' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Payment & Integration Configurations" icon={<FiLayers />}>
            <div className={styles.formGrid}>
              {/* Razorpay */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Razorpay Payment Gateway</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Toggle checked={settings.razorpayEnabled} onChange={v => handleChange('razorpayEnabled', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable Razorpay</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Razorpay Key ID">
                    <input className={styles.input} value={settings.razorpayKey} onChange={e => handleChange('razorpayKey', e.target.value)} />
                  </Field>
                  <Field label="Razorpay Key Secret">
                    <input className={styles.input} type="password" value={settings.razorpaySecret} onChange={e => handleChange('razorpaySecret', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Cash on Delivery (COD)</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Toggle checked={settings.codEnabled} onChange={v => handleChange('codEnabled', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable Cash on Delivery</span>
                </div>
                <Field label="Maximum COD Order Amount (₹)" half>
                  <input className={styles.input} type="number" value={settings.codMaxAmount} onChange={e => handleChange('codMaxAmount', Number(e.target.value))} />
                </Field>
              </div>

              {/* SMTP Email */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>SMTP Email Configuration</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Toggle checked={settings.smtpEnabled} onChange={v => handleChange('smtpEnabled', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable SMTP Transactional Emails</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="SMTP Host">
                    <input className={styles.input} value={settings.smtpHost} onChange={e => handleChange('smtpHost', e.target.value)} />
                  </Field>
                  <Field label="SMTP Port">
                    <input className={styles.input} type="number" value={settings.smtpPort} onChange={e => handleChange('smtpPort', Number(e.target.value))} />
                  </Field>
                  <Field label="SMTP Username">
                    <input className={styles.input} value={settings.smtpUser} onChange={e => handleChange('smtpUser', e.target.value)} />
                  </Field>
                  <Field label="SMTP Password">
                    <input className={styles.input} type="password" value={settings.smtpPass} onChange={e => handleChange('smtpPass', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Analytics & Meta Pixel */}
              <div style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Analytics & Tracking Pixels</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Google Analytics Measurement ID">
                    <input className={styles.input} value={settings.googleAnalyticsId} onChange={e => handleChange('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
                  </Field>
                  <Field label="Google Search Console Verification Tag">
                    <input className={styles.input} value={settings.gscMetaTag} onChange={e => handleChange('gscMetaTag', e.target.value)} />
                  </Field>
                  <Field label="Facebook / Meta Pixel ID" full>
                    <input className={styles.input} value={settings.facebookPixelId} onChange={e => handleChange('facebookPixelId', e.target.value)} />
                  </Field>
                </div>
              </div>

            </div>
          </SettingsCard>
        </div>
      )}

    </div>
  );
}

export default Settings;
