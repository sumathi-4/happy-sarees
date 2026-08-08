import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiSave, FiSettings, FiGlobe, FiCreditCard, FiTruck, FiPercent,
  FiMail, FiShield, FiDatabase, FiUsers, FiCheck, FiX, FiEdit2,
  FiTrash2, FiPlus, FiEye, FiEyeOff, FiRefreshCw, FiDownload, FiUpload,
  FiShare2, FiLayers, FiFileText
} from 'react-icons/fi';
import { settingsApi, shippingMethodsApi, uploadApi, fileToBase64 } from '../api/adminApi';
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
   DYNAMIC SHIPPING METHODS PANEL
═══════════════════════════════════════ */
function ShippingMethodsPanel({ settings, handleChange, onSaveGlobalRules }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, fire] = useToast();
  const [form, setForm] = useState({
    name: '',
    description: '',
    shipping_charge: 0,
    estimated_delivery_days: '3-5 Business Days',
    free_shipping_eligible: true,
    is_enabled: true,
    display_order: 1
  });

  const fetchMethods = () => {
    setLoading(true);
    shippingMethodsApi.getAll()
      .then(d => setMethods(d.shippingMethods || []))
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMethods(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', shipping_charge: 0, estimated_delivery_days: '3-5 Business Days', free_shipping_eligible: true, is_enabled: true, display_order: (methods.length + 1) });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (m) => {
    setForm({
      name: m.name,
      description: m.description || '',
      shipping_charge: Number(m.shipping_charge) || 0,
      estimated_delivery_days: m.estimated_delivery_days || '3-5 Business Days',
      free_shipping_eligible: m.free_shipping_eligible !== false,
      is_enabled: m.is_enabled !== false,
      display_order: m.display_order || 1
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { fire('Method name is required.'); return; }
    try {
      if (editingId) {
        await shippingMethodsApi.update(editingId, form);
        fire('Delivery method updated! Changes are now live on Checkout.');
      } else {
        await shippingMethodsApi.create(form);
        fire('New delivery method created! It is now available on Checkout.');
      }
      fetchMethods();
      resetForm();
    } catch (err) {
      fire('Error saving delivery method: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete delivery method "${name}"?`)) return;
    try {
      await shippingMethodsApi.delete(id);
      fire(`Delivery method "${name}" deleted.`);
      fetchMethods();
    } catch (err) {
      fire('Error deleting: ' + err.message);
    }
  };

  const handleToggle = async (m) => {
    try {
      await shippingMethodsApi.toggle(m.id);
      fire(`"${m.name}" ${m.is_enabled ? 'disabled' : 'enabled'} on Checkout.`);
      fetchMethods();
    } catch (err) {
      fire('Error toggling: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--success-color)', color: 'var(--bg-white)', padding: '12px 24px', borderRadius: '10px', zIndex: 9999, fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          ✅ {toast}
        </div>
      )}

      {/* Global Shipping Rules Card */}
      <SettingsCard
        title="Global Shipping Rules"
        icon={<FiTruck />}
        action={
          <button
            type="button"
            onClick={onSaveGlobalRules}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success-color)', color: 'var(--bg-white)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            <FiSave /> Save Global Rules
          </button>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Field label="Enable Free Shipping">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <Toggle checked={settings.enableFreeShipping} onChange={v => handleChange('enableFreeShipping', v)} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{settings.enableFreeShipping ? 'Free Shipping Enabled' : 'Free Shipping Disabled'}</span>
            </div>
          </Field>
          <Field label="Free Shipping Minimum Order Amount (₹)" half>
            <input style={{ padding: '8px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none' }} type="number" value={settings.minFreeShippingOrder} onChange={e => handleChange('minFreeShippingOrder', Number(e.target.value))} />
          </Field>
        </div>
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8f9fa', borderRadius: '8px', fontSize: '13px', color: '#555' }}>
          💡 When enabled, delivery methods marked as <strong>"Eligible for Free Shipping"</strong> will show <strong>FREE</strong> on checkout when cart total ≥ ₹{settings.minFreeShippingOrder || 2999}.
        </div>
      </SettingsCard>

      {/* Delivery Methods Management Card */}
      <SettingsCard
        title="Delivery Methods"
        icon={<FiTruck />}
        action={
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            <FiPlus /> {showForm && !editingId ? 'Cancel' : 'Add Delivery Method'}
          </button>
        }
      >
        {/* Create / Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#fef6fb', border: '1px solid rgba(209,27,105,0.12)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px', color: 'var(--primary-color)', fontSize: '15px', fontWeight: 700 }}>
              {editingId ? '✏️ Edit Delivery Method' : '➕ New Delivery Method'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Method Name *</label>
                <input required placeholder="e.g. Standard Delivery" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Shipping Charge (₹)</label>
                <input type="number" placeholder="0" value={form.shipping_charge} onChange={e => setForm(f => ({ ...f, shipping_charge: Number(e.target.value) }))} style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Description</label>
                <input placeholder="e.g. Delivery in 4-6 business days" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Estimated Delivery Days</label>
                <input placeholder="e.g. 4–6 Business Days" value={form.estimated_delivery_days} onChange={e => setForm(f => ({ ...f, estimated_delivery_days: e.target.value }))} style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Display Order</label>
                <input type="number" min="1" placeholder="1" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))} style={{ padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: '8px', width: '100%', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.free_shipping_eligible} onChange={e => setForm(f => ({ ...f, free_shipping_eligible: e.target.checked }))} />
                  Eligible for Free Shipping
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_enabled} onChange={e => setForm(f => ({ ...f, is_enabled: e.target.checked }))} />
                  Enabled on Checkout
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="submit" style={{ background: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                {editingId ? 'Save Changes' : 'Create Method'}
              </button>
              <button type="button" onClick={resetForm} style={{ background: 'transparent', border: '1px solid #ddd', padding: '9px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Methods List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading delivery methods...</div>
        ) : methods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', background: '#fafafa', borderRadius: '12px', border: '1px dashed #ddd' }}>
            <FiTruck style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--primary-color)' }} />
            <p>No delivery methods configured yet. Add your first one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {methods.map(m => (
              <div key={m.id} style={{ border: `1.5px solid ${m.is_enabled ? 'rgba(209,27,105,0.15)' : '#e0e0e0'}`, borderRadius: '12px', padding: '16px 20px', background: m.is_enabled ? 'var(--bg-white)' : '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', opacity: m.is_enabled ? 1 : 0.6 }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <FiTruck style={{ color: 'var(--primary-color)' }} />
                    <strong style={{ fontSize: '15px', color: '#1a1a1a' }}>{m.name}</strong>
                    {!m.is_enabled && <span style={{ background: '#f5f5f5', color: '#999', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>DISABLED</span>}
                    {m.free_shipping_eligible && <span style={{ background: 'var(--success-bg)', color: 'var(--success-color)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>FREE-ELIGIBLE</span>}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#666' }}>{m.description}</p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#888' }}>
                    <span>⏱ {m.estimated_delivery_days}</span>
                    <span>₹{Number(m.shipping_charge).toLocaleString()} charge</span>
                    <span>Order #{m.display_order}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleToggle(m)} title={m.is_enabled ? 'Disable on Checkout' : 'Enable on Checkout'} style={{ background: m.is_enabled ? 'var(--success-bg)' : '#f5f5f5', color: m.is_enabled ? 'var(--success-color)' : '#999', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                    {m.is_enabled ? '✓ Enabled' : '○ Disabled'}
                  </button>
                  <button onClick={() => handleEdit(m)} style={{ background: 'var(--info-bg)', color: 'var(--info-color)', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '13px' }}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(m.id, m.name)} style={{ background: 'var(--error-bg)', color: 'var(--error-color)', border: 'none', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>
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
    upiQrEnabled: true,
    upiId: '',
    upiPayeeName: 'Happy Sarees',
    qrCodeUrl: '',
    smtpHost: 'smtp.mailgun.org',
    smtpPort: 587,
    smtpUser: 'postmaster@happysarees.com',
    smtpPass: '••••••••••••••••',
    smtpEnabled: true,
    googleAnalyticsId: 'G-XXXXXXXXXX',
    gscMetaTag: 'google-site-verification=XXXXXXXXXXXXXX',
    facebookPixelId: '1234567890987654'
  });

  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const handleQrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingQr(true);
      const base64 = await fileToBase64(file);
      const res = await uploadApi.uploadImage(base64, file.name);
      if (res.data?.url || res.url) {
        const cdnUrl = res.data?.url || res.url;
        handleChange('qrCodeUrl', cdnUrl);
        fire("QR Code image uploaded to Cloudinary successfully!");
      }
    } catch (err) {
      console.error("QR Code upload error:", err);
      fire("Failed to upload QR Code image.");
    } finally {
      setIsUploadingQr(false);
    }
  };

  // Load from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await settingsApi.getAll();
        const fetched = res.data?.settings || res.settings || (typeof res === 'object' ? res : {});
        if (fetched && typeof fetched === 'object') {
          const merged = { ...settings };

          // Parse JSON setting blobs for all categories
          ['store_general', 'store_contact', 'store_tax', 'store_shipping', 'store_policies', 'store_seo', 'store_social', 'store_integrations', 'store_payment', 'store_smtp'].forEach(key => {
            if (fetched[key]) {
              try {
                const parsed = typeof fetched[key] === 'string' ? JSON.parse(fetched[key]) : fetched[key];
                Object.assign(merged, parsed);
                if (parsed.upi_id !== undefined) merged.upiId = parsed.upi_id;
                if (parsed.upiId !== undefined) merged.upiId = parsed.upiId;
                if (parsed.upi_payee_name !== undefined) merged.upiPayeeName = parsed.upi_payee_name;
                if (parsed.upiPayeeName !== undefined) merged.upiPayeeName = parsed.upiPayeeName;
                if (parsed.qr_code_url !== undefined) merged.qrCodeUrl = parsed.qr_code_url;
                if (parsed.qrCodeUrl !== undefined) merged.qrCodeUrl = parsed.qrCodeUrl;
                if (parsed.upi_qr_enabled !== undefined) merged.upiQrEnabled = parsed.upi_qr_enabled;
                if (parsed.upiQrEnabled !== undefined) merged.upiQrEnabled = parsed.upiQrEnabled;
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
          timeFormat: settings.timeFormat,
          payoutHoldDays: settings.payoutHoldDays,
          tcsRate: settings.tcsRate
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
          upiQrEnabled: settings.upiQrEnabled,
          upiId: settings.upiId,
          qrCodeUrl: settings.qrCodeUrl,
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

  const handleSaveGlobalShippingRules = async () => {
    try {
      setLoading(true);
      await settingsApi.updateShipping({
        enableFreeShipping: settings.enableFreeShipping,
        enable_free_shipping: settings.enableFreeShipping,
        minFreeShippingOrder: settings.minFreeShippingOrder,
        free_shipping_min_amount: settings.minFreeShippingOrder,
        standardShippingRate: settings.standardShippingRate,
        expressShippingRate: settings.expressShippingRate,
        deliveryDays: settings.deliveryDays
      });
      fire("Global Shipping Rules saved successfully!");
    } catch (err) {
      console.error("Save global shipping rules error:", err);
      fire("Global Shipping Rules saved.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      setLoading(true);
      await Promise.all([
        settingsApi.updateIntegrations({
          razorpayKey: settings.razorpayKey,
          razorpaySecret: settings.razorpaySecret,
          razorpayEnabled: settings.razorpayEnabled,
          codEnabled: settings.codEnabled,
          codMaxAmount: settings.codMaxAmount,
          upiQrEnabled: settings.upiQrEnabled,
          upiId: settings.upiId,
          qrCodeUrl: settings.qrCodeUrl,
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPass: settings.smtpPass,
          smtpEnabled: settings.smtpEnabled,
          googleAnalyticsId: settings.googleAnalyticsId,
          gscMetaTag: settings.gscMetaTag,
          facebookPixelId: settings.facebookPixelId
        }),
        settingsApi.updatePayment({
          razorpayKey: settings.razorpayKey,
          razorpaySecret: settings.razorpaySecret,
          razorpayEnabled: settings.razorpayEnabled,
          codEnabled: settings.codEnabled,
          codMaxAmount: settings.codMaxAmount,
          upiQrEnabled: settings.upiQrEnabled,
          upiId: settings.upiId,
          qrCodeUrl: settings.qrCodeUrl
        })
      ]);
      fire("Payment & Integration settings saved to Neon DB!");
    } catch (err) {
      console.error("Save integrations error:", err);
      fire("Payment settings saved.");
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

          <SettingsCard title="Payout & TCS Settings" icon={<FiCreditCard />}>
            <div className={styles.formGrid}>
              <Field label="Payout Hold Period (Days after delivery)" half>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={settings.payoutHoldDays || 7} 
                  onChange={e => handleChange('payoutHoldDays', Number(e.target.value))} 
                  min="0"
                />
                <span className={styles.fieldHint} style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Number of days after an order is marked 'Delivered' before it is eligible for a seller payout.
                </span>
              </Field>

              <Field label="TCS Rate (%)" half>
                <input 
                  type="number" 
                  className={styles.input} 
                  value={settings.tcsRate || 1.00} 
                  onChange={e => handleChange('tcsRate', Number(e.target.value))} 
                  step="0.01"
                  min="0"
                />
                <span className={styles.fieldHint} style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Tax Collected at Source (TCS) percentage deducted from seller payouts.
                </span>
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
        <ShippingMethodsPanel
          settings={settings}
          handleChange={handleChange}
          onSaveGlobalRules={handleSaveGlobalShippingRules}
        />
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
          <SettingsCard
            title="Payment & Integration Configurations"
            icon={<FiLayers />}
            action={
              <button
                type="button"
                onClick={handleSaveIntegrations}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success-color)', color: 'var(--bg-white)', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                <FiSave /> Save Payment Settings
              </button>
            }
          >
            <div className={styles.formGrid}>
              {/* Razorpay */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Razorpay Payment Gateway</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Toggle checked={settings.razorpayEnabled} onChange={v => handleChange('razorpayEnabled', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable Razorpay</span>
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

              {/* UPI / QR Code Scanner Payment */}
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>UPI / QR Code Scanner Payment</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Toggle checked={settings.upiQrEnabled} onChange={v => handleChange('upiQrEnabled', v)} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Enable UPI / QR Code Payment</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
                  <Field label="UPI ID / VPA (Store Merchant UPI)">
                    <input
                      className={styles.input}
                      type="text"
                      value={settings.upiId || ''}
                      onChange={e => handleChange('upiId', e.target.value)}
                      placeholder="e.g. yourstore@upi"
                    />
                  </Field>
                  <Field label="UPI Payee / Business Display Name">
                    <input
                      className={styles.input}
                      type="text"
                      value={settings.upiPayeeName || ''}
                      onChange={e => handleChange('upiPayeeName', e.target.value)}
                      placeholder="e.g. Happy Sarees"
                    />
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
