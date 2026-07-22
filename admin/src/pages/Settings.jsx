import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  FiSave, FiSettings, FiGlobe, FiCreditCard, FiTruck, FiPercent,
  FiMail, FiShield, FiDatabase, FiUsers, FiCheck, FiX, FiEdit2,
  FiTrash2, FiPlus, FiEye, FiEyeOff, FiRefreshCw, FiDownload, FiUpload
} from 'react-icons/fi';
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
function Field({ label, children, half }) {
  return (
    <div className={`${styles.field} ${half ? styles.fieldHalf : ''}`}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   STORE SETTINGS
═══════════════════════════════════════ */
function StoreSettings() {
  const [toast, fire] = useToast();
  const [form, setForm] = useState({
    storeName: 'Happy Sarees',
    tagline: 'Celebrate Every Tradition',
    email: 'support@happysarees.com',
    phone: '+91 98765 43210',
    mobile: '+91 91234 56789',
    address: '123, Silk Street, Anna Nagar,\nChennai, Tamil Nadu - 600040, India',
    gst: '33ABCDE1234F1Z5',
    currency: 'INR',
    timezone: 'Asia/Kolkata (GMT +5:30)',
    language: 'English',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '12 Hours (hh:mm AM/PM)'
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Store Settings</h2>
          <p className={styles.pageDesc}>Manage your store information and configuration</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Store settings saved successfully.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsGrid}>

        {/* General Information */}
        <SettingsCard title="General Information" icon={<FiSettings />}>
          <div className={styles.formGrid}>
            <Field label="Store Name">
              <input className={styles.input} value={form.storeName} onChange={e => set('storeName', e.target.value)} />
            </Field>
            <Field label="Store Tagline">
              <input className={styles.input} value={form.tagline} onChange={e => set('tagline', e.target.value)} />
            </Field>
            <Field label="Store Logo">
              <div className={styles.uploadBox}>
                <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=80&q=80" alt="logo" className={styles.uploadPreview} />
                <div className={styles.uploadInfo}>
                  <span>happy-sarees-logo.png</span>
                  <span className={styles.uploadSize}>200×60 px</span>
                </div>
                <button className={styles.changeBtn}>Change</button>
                <button className={styles.deleteBtn}><FiX /></button>
              </div>
            </Field>
            <Field label="Favicon">
              <div className={styles.uploadBox}>
                <div className={styles.faviconBox}>🧡</div>
                <div className={styles.uploadInfo}>
                  <span>favicon.ico</span>
                  <span className={styles.uploadSize}>32×32 px</span>
                </div>
                <button className={styles.changeBtn}>Change</button>
                <button className={styles.deleteBtn}><FiX /></button>
              </div>
            </Field>
            <Field label="Currency">
              <select className={styles.select} value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="INR">INR – Indian Rupee (₹)</option>
                <option value="USD">USD – US Dollar ($)</option>
                <option value="EUR">EUR – Euro (€)</option>
              </select>
            </Field>
            <Field label="Time Zone">
              <select className={styles.select} value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                <option>Asia/Kolkata (GMT +5:30)</option>
                <option>UTC</option>
                <option>America/New_York</option>
              </select>
            </Field>
            <Field label="Language">
              <select className={styles.select} value={form.language} onChange={e => set('language', e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
              </select>
            </Field>
            <Field label="Date Format">
              <select className={styles.select} value={form.dateFormat} onChange={e => set('dateFormat', e.target.value)}>
                <option>DD MMM YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </Field>
            <Field label="Time Format">
              <select className={styles.select} value={form.timeFormat} onChange={e => set('timeFormat', e.target.value)}>
                <option>12 Hours (hh:mm AM/PM)</option>
                <option>24 Hours (HH:mm)</option>
              </select>
            </Field>
          </div>
        </SettingsCard>

        {/* Contact Details */}
        <SettingsCard title="Contact Details" icon={<FiMail />}>
          <div className={styles.formGrid}>
            <Field label="Email">
              <input className={styles.input} value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={styles.input} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
            <Field label="Mobile">
              <input className={styles.input} value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </Field>
            <Field label="GST Number">
              <input className={styles.input} value={form.gst} onChange={e => set('gst', e.target.value)} />
            </Field>
            <Field label="Store Address">
              <textarea className={styles.textarea} rows={3} value={form.address} onChange={e => set('address', e.target.value)} />
            </Field>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   WEBSITE SETTINGS
═══════════════════════════════════════ */
function WebsiteSettings() {
  const [toast, fire] = useToast();
  const [seo, setSeo] = useState({ title: 'Happy Sarees – Handloom Luxury', description: 'Shop premium sarees handcrafted with tradition.', keywords: 'sarees, silk, organza, kanchipuram' });
  const [social, setSocial] = useState({ instagram: 'https://instagram.com/happysarees', facebook: 'https://facebook.com/happysarees', youtube: '', twitter: '' });
  const [analytics, setAnalytics] = useState({ ga: 'G-XXXXXXXXXX', fbPixel: '', hotjar: '' });
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Website Settings</h2>
          <p className={styles.pageDesc}>Configure SEO, social media, analytics, and maintenance settings</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Website settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>

        <SettingsCard title="SEO Settings" icon={<FiGlobe />}>
          <div className={styles.formGrid}>
            <Field label="Meta Title">
              <input className={styles.input} value={seo.title} onChange={e => setSeo(p => ({ ...p, title: e.target.value }))} />
            </Field>
            <Field label="Meta Keywords">
              <input className={styles.input} value={seo.keywords} onChange={e => setSeo(p => ({ ...p, keywords: e.target.value }))} />
            </Field>
            <Field label="Meta Description">
              <textarea className={styles.textarea} rows={3} value={seo.description} onChange={e => setSeo(p => ({ ...p, description: e.target.value }))} />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Social Media Links" icon={<FiGlobe />}>
          <div className={styles.formGrid}>
            {[['Instagram', 'instagram'], ['Facebook', 'facebook'], ['YouTube', 'youtube'], ['Twitter / X', 'twitter']].map(([label, key]) => (
              <Field key={key} label={label}>
                <input className={styles.input} placeholder={`https://${key}.com/...`} value={social[key]} onChange={e => setSocial(p => ({ ...p, [key]: e.target.value }))} />
              </Field>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Analytics & Tracking IDs" icon={<FiPercent />}>
          <div className={styles.formGrid}>
            <Field label="Google Analytics ID">
              <input className={styles.input} value={analytics.ga} onChange={e => setAnalytics(p => ({ ...p, ga: e.target.value }))} placeholder="G-XXXXXXXXXX" />
            </Field>
            <Field label="Facebook Pixel ID">
              <input className={styles.input} value={analytics.fbPixel} onChange={e => setAnalytics(p => ({ ...p, fbPixel: e.target.value }))} placeholder="1234567890" />
            </Field>
            <Field label="Hotjar ID">
              <input className={styles.input} value={analytics.hotjar} onChange={e => setAnalytics(p => ({ ...p, hotjar: e.target.value }))} placeholder="1234567" />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Maintenance Mode" icon={<FiShield />}>
          <div className={styles.toggleRow}>
            <div>
              <strong>Enable Maintenance Mode</strong>
              <p className={styles.toggleDesc}>Temporarily hide the storefront from customers while you make updates.</p>
            </div>
            <Toggle checked={maintenance} onChange={setMaintenance} />
          </div>
          {maintenance && <div className={styles.warningBox}><FiShield /> Storefront is currently in maintenance mode. Customers cannot access it.</div>}
        </SettingsCard>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PAYMENT SETTINGS
═══════════════════════════════════════ */
function PaymentSettings() {
  const [toast, fire] = useToast();
  const [gateways, setGateways] = useState([
    { id: 'razorpay', label: 'Razorpay', active: true, keyId: 'rzp_live_XXXXXXXXXX', keySecret: '••••••••••••' },
    { id: 'stripe', label: 'Stripe', active: true, keyId: 'pk_live_XXXXXXXXXX', keySecret: '••••••••••••' },
    { id: 'cod', label: 'Cash on Delivery', active: true, keyId: '', keySecret: '' },
    { id: 'upi', label: 'UPI / QR Payments', active: true, upiId: 'happysarees@upi' }
  ]);

  const toggle = (id) => {
    setGateways(p => p.map(g => g.id === id ? { ...g, active: !g.active } : g));
    fire('Payment gateway updated.');
  };

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Payment Settings</h2>
          <p className={styles.pageDesc}>Configure payment gateways and methods for your store</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Payment settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>
        {gateways.map(gw => (
          <SettingsCard key={gw.id} title={gw.label} icon={<FiCreditCard />}
            action={
              <div className={styles.cardAction}>
                <span className={gw.active ? styles.activePill : styles.inactivePill}>{gw.active ? 'Active' : 'Inactive'}</span>
                <Toggle checked={gw.active} onChange={() => toggle(gw.id)} />
              </div>
            }
          >
            {gw.id !== 'cod' && (
              <div className={styles.formGrid}>
                {gw.upiId !== undefined ? (
                  <Field label="UPI ID">
                    <input className={styles.input} defaultValue={gw.upiId} />
                  </Field>
                ) : (
                  <>
                    <Field label="API Key ID">
                      <input className={styles.input} defaultValue={gw.keyId} />
                    </Field>
                    <Field label="API Key Secret">
                      <input className={styles.input} type="password" defaultValue={gw.keySecret} />
                    </Field>
                  </>
                )}
                <Field label="Test / Live Mode">
                  <select className={styles.select}>
                    <option>Live</option>
                    <option>Test</option>
                  </select>
                </Field>
              </div>
            )}
            {gw.id === 'cod' && (
              <div className={styles.formGrid}>
                <Field label="COD Charge (₹)">
                  <input className={styles.input} defaultValue="0" type="number" />
                </Field>
                <Field label="COD Availability">
                  <select className={styles.select}>
                    <option>All Areas</option>
                    <option>Metro Cities Only</option>
                  </select>
                </Field>
              </div>
            )}
          </SettingsCard>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SHIPPING SETTINGS
═══════════════════════════════════════ */
function ShippingSettings() {
  const [toast, fire] = useToast();
  const [form, setForm] = useState({
    standardCharge: '99',
    freeThreshold: '999',
    expressCharge: '199',
    zones: [
      { id: 1, name: 'Metro Cities', states: 'Delhi, Mumbai, Chennai, Bangalore, Kolkata', charge: '₹49' },
      { id: 2, name: 'Tier 2 Cities', states: 'Coimbatore, Madurai, Surat, Jaipur', charge: '₹79' },
      { id: 3, name: 'Rest of India', states: 'All remaining pincodes', charge: '₹99' },
      { id: 4, name: 'International', states: 'USA, UK, UAE, Singapore', charge: '₹999' }
    ]
  });

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Shipping Settings</h2>
          <p className={styles.pageDesc}>Manage shipping charges, zones and delivery options</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Shipping settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>
        <SettingsCard title="Shipping Charges" icon={<FiTruck />}>
          <div className={styles.formGrid}>
            <Field label="Standard Shipping Charge (₹)">
              <input className={styles.input} type="number" value={form.standardCharge} onChange={e => setForm(p => ({ ...p, standardCharge: e.target.value }))} />
            </Field>
            <Field label="Express Shipping Charge (₹)">
              <input className={styles.input} type="number" value={form.expressCharge} onChange={e => setForm(p => ({ ...p, expressCharge: e.target.value }))} />
            </Field>
            <Field label="Free Shipping Threshold (₹)">
              <input className={styles.input} type="number" value={form.freeThreshold} onChange={e => setForm(p => ({ ...p, freeThreshold: e.target.value }))} />
            </Field>
            <Field label="Estimated Delivery Time">
              <select className={styles.select}>
                <option>3–5 Business Days</option>
                <option>5–7 Business Days</option>
                <option>7–10 Business Days</option>
              </select>
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Delivery Zones" icon={<FiGlobe />}
          action={<button className={styles.addBtn} onClick={() => fire('Zone editor opening...')}><FiPlus /> Add Zone</button>}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Coverage</th>
                <th>Charge</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {form.zones.map(z => (
                <tr key={z.id}>
                  <td><strong>{z.name}</strong></td>
                  <td>{z.states}</td>
                  <td><strong>{z.charge}</strong></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.iconBtn}><FiEdit2 /></button>
                    <button className={styles.iconBtnDanger}><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsCard>

        <SettingsCard title="Shipping Methods" icon={<FiTruck />}>
          <div className={styles.formGrid}>
            {['Standard Delivery', 'Express Delivery', 'Same Day Delivery', 'International Courier'].map(m => (
              <div key={m} className={styles.toggleRow}>
                <strong>{m}</strong>
                <Toggle checked={m !== 'Same Day Delivery'} onChange={() => fire(`${m} toggled.`)} />
              </div>
            ))}
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   TAX SETTINGS
═══════════════════════════════════════ */
function TaxSettings() {
  const [toast, fire] = useToast();
  const [taxes, setTaxes] = useState([
    { id: 'gst', label: 'GST (Goods & Services Tax)', rate: 18, enabled: true },
    { id: 'cgst', label: 'CGST (Central GST)', rate: 9, enabled: true },
    { id: 'sgst', label: 'SGST (State GST)', rate: 9, enabled: true },
    { id: 'igst', label: 'IGST (Integrated GST)', rate: 18, enabled: true }
  ]);

  const updateRate = (id, v) => setTaxes(p => p.map(t => t.id === id ? { ...t, rate: v } : t));
  const toggleTax = (id) => setTaxes(p => p.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Tax Settings</h2>
          <p className={styles.pageDesc}>Configure GST, CGST, SGST, and IGST tax rates</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Tax settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>
        <SettingsCard title="Tax Configuration" icon={<FiPercent />}>
          <div className={styles.taxGrid}>
            {taxes.map(t => (
              <div key={t.id} className={styles.taxCard}>
                <div className={styles.taxCardHeader}>
                  <strong>{t.label}</strong>
                  <Toggle checked={t.enabled} onChange={() => toggleTax(t.id)} />
                </div>
                <div className={styles.taxRateRow}>
                  <label>Rate (%)</label>
                  <input
                    className={styles.rateInput}
                    type="number"
                    value={t.rate}
                    onChange={e => updateRate(t.id, Number(e.target.value))}
                    disabled={!t.enabled}
                  />
                  <span className={`${styles.taxStatus} ${t.enabled ? styles.taxActive : styles.taxInactive}`}>
                    {t.enabled ? 'Applied' : 'Disabled'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Tax Applicability Rules" icon={<FiPercent />}>
          <div className={styles.formGrid}>
            <Field label="Products Taxable">
              <select className={styles.select}>
                <option>All Products</option>
                <option>Taxable Products Only</option>
                <option>Non-taxable Products Only</option>
              </select>
            </Field>
            <Field label="Tax Calculation Based On">
              <select className={styles.select}>
                <option>Shipping Address</option>
                <option>Billing Address</option>
                <option>Store Address</option>
              </select>
            </Field>
            <div className={styles.toggleRow}>
              <div>
                <strong>Display Prices Including Tax</strong>
                <p className={styles.toggleDesc}>Show tax-inclusive prices on storefront</p>
              </div>
              <Toggle checked={true} onChange={() => fire('Price display preference updated.')} />
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EMAIL / SMTP SETTINGS
═══════════════════════════════════════ */
function EmailSettings() {
  const [toast, fire] = useToast();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    host: 'smtp.gmail.com', port: '587',
    username: 'support@happysarees.com', password: 'password123',
    fromName: 'Happy Sarees', fromEmail: 'noreply@happysarees.com',
    encryption: 'TLS', testEmail: ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Email / SMTP Settings</h2>
          <p className={styles.pageDesc}>Configure email server settings for transactional emails</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('Email settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>
        <SettingsCard title="SMTP Configuration" icon={<FiMail />}>
          <div className={styles.formGrid}>
            <Field label="SMTP Host">
              <input className={styles.input} value={form.host} onChange={e => set('host', e.target.value)} placeholder="smtp.gmail.com" />
            </Field>
            <Field label="SMTP Port">
              <input className={styles.input} value={form.port} onChange={e => set('port', e.target.value)} placeholder="587" />
            </Field>
            <Field label="Username / Email">
              <input className={styles.input} value={form.username} onChange={e => set('username', e.target.value)} />
            </Field>
            <Field label="Password">
              <div className={styles.passwordField}>
                <input className={styles.input} type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} />
                <button className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>
            <Field label="From Name">
              <input className={styles.input} value={form.fromName} onChange={e => set('fromName', e.target.value)} />
            </Field>
            <Field label="From Email Address">
              <input className={styles.input} value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
            </Field>
            <Field label="Encryption">
              <select className={styles.select} value={form.encryption} onChange={e => set('encryption', e.target.value)}>
                <option>TLS</option>
                <option>SSL</option>
                <option>None</option>
              </select>
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="Send Test Email" icon={<FiMail />}>
          <div className={styles.testEmailRow}>
            <input
              className={styles.input}
              placeholder="Enter recipient email address..."
              value={form.testEmail}
              onChange={e => set('testEmail', e.target.value)}
              style={{ flex: 1 }}
            />
            <button className={styles.saveBtn} onClick={() => fire(`Test email sent to ${form.testEmail || 'admin'}!`)}>
              Send Test Email
            </button>
          </div>
          <p className={styles.toggleDesc} style={{ marginTop: '10px' }}>
            A test email will be sent using the above SMTP configuration to verify your settings.
          </p>
        </SettingsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   SYSTEM SETTINGS
═══════════════════════════════════════ */
function SystemSettings() {
  const [toast, fire] = useToast();
  const [form, setForm] = useState({
    sessionTimeout: '30', loginAttempts: '5',
    twoFactor: true, cacheEnabled: true
  });

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>System Settings</h2>
          <p className={styles.pageDesc}>Configure system security, sessions and cache management</p>
        </div>
        <button className={styles.saveBtn} onClick={() => fire('System settings saved.')}>
          <FiSave /> Save Changes
        </button>
      </div>

      <div className={styles.sectionsStack}>
        <SettingsCard title="Security & Session Configuration" icon={<FiShield />}>
          <div className={styles.formGrid}>
            <Field label="Session Timeout (minutes)">
              <input className={styles.input} type="number" value={form.sessionTimeout}
                onChange={e => setForm(p => ({ ...p, sessionTimeout: e.target.value }))} />
            </Field>
            <Field label="Max Login Attempts Before Lockout">
              <input className={styles.input} type="number" value={form.loginAttempts}
                onChange={e => setForm(p => ({ ...p, loginAttempts: e.target.value }))} />
            </Field>

            <div className={styles.toggleRow}>
              <div>
                <strong>Two-Factor Authentication</strong>
                <p className={styles.toggleDesc}>Require 2FA for all admin logins</p>
              </div>
              <Toggle checked={form.twoFactor} onChange={v => setForm(p => ({ ...p, twoFactor: v }))} />
            </div>

            <div className={styles.toggleRow}>
              <div>
                <strong>Force HTTPS</strong>
                <p className={styles.toggleDesc}>Redirect all HTTP traffic to HTTPS</p>
              </div>
              <Toggle checked={true} onChange={() => fire('HTTPS setting updated.')} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Cache Management" icon={<FiRefreshCw />}>
          <div className={styles.cacheRow}>
            <div>
              <strong>Application Cache</strong>
              <p className={styles.toggleDesc}>Last cleared: 22 May 2026, 02:30 AM — Cache size: 512.45 MB</p>
            </div>
            <button className={styles.cacheBtn} onClick={() => fire('Application cache cleared successfully.')}>
              <FiRefreshCw /> Clear Cache
            </button>
          </div>
        </SettingsCard>

        <SettingsCard title="Maintenance & Logging" icon={<FiDatabase />}>
          <div className={styles.formGrid}>
            <div className={styles.toggleRow}>
              <div>
                <strong>Error Logging</strong>
                <p className={styles.toggleDesc}>Log application errors for debugging</p>
              </div>
              <Toggle checked={true} onChange={() => fire('Error logging toggled.')} />
            </div>
            <div className={styles.toggleRow}>
              <div>
                <strong>Debug Mode</strong>
                <p className={styles.toggleDesc}>Show detailed error messages (disable in production)</p>
              </div>
              <Toggle checked={false} onChange={() => fire('Debug mode toggled.')} />
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   BACKUP & RESTORE
═══════════════════════════════════════ */
function BackupRestore() {
  const [toast, fire] = useToast();
  const [backups] = useState([
    { id: 1, date: '22 May 2026, 02:30 AM', size: '512.45 MB', location: 'AWS S3', status: 'Complete' },
    { id: 2, date: '15 May 2026, 03:00 AM', size: '498.12 MB', location: 'AWS S3', status: 'Complete' },
    { id: 3, date: '08 May 2026, 02:45 AM', size: '475.60 MB', location: 'AWS S3', status: 'Complete' },
    { id: 4, date: '01 May 2026, 03:15 AM', size: '461.20 MB', location: 'Local', status: 'Complete' }
  ]);

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Backup & Restore</h2>
          <p className={styles.pageDesc}>Create, manage, and restore your store data backups</p>
        </div>
      </div>

      <div className={styles.sectionsStack}>
        <SettingsCard title="Backup Status" icon={<FiDatabase />}>
          <div className={styles.backupStatus}>
            <div className={styles.statBox}>
              <span>Last Backup</span>
              <strong>22 May 2026, 02:30 AM</strong>
            </div>
            <div className={styles.statBox}>
              <span>Backup Size</span>
              <strong>512.45 MB</strong>
            </div>
            <div className={styles.statBox}>
              <span>Backup Location</span>
              <strong>AWS S3</strong>
            </div>
            <div className={styles.statBox}>
              <span>Auto Backup</span>
              <strong>Weekly (Every Monday)</strong>
            </div>
          </div>
          <div className={styles.backupBtns}>
            <button className={styles.saveBtn} onClick={() => fire('Full backup initiated. This may take a few minutes.')}>
              <FiDownload /> Create Backup
            </button>
            <button className={styles.outlineBtn} onClick={() => fire('Restore wizard opening...')}>
              <FiUpload /> Restore Backup
            </button>
          </div>
        </SettingsCard>

        <SettingsCard title="Backup History" icon={<FiDatabase />}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Size</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.id}>
                  <td>{b.date}</td>
                  <td>{b.size}</td>
                  <td>{b.location}</td>
                  <td><span className={styles.activePill}>{b.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.iconBtn} title="Download"><FiDownload /></button>
                    <button className={styles.iconBtn} title="Restore"><FiUpload /></button>
                    <button className={styles.iconBtnDanger} title="Delete"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   ADMIN MANAGEMENT
═══════════════════════════════════════ */
const ROLES_DATA = [
  { id: 1, name: 'Super Admin', description: 'Full access to all features', users: 1, status: 'Active' },
  { id: 2, name: 'Admin', description: 'Access to most features', users: 3, status: 'Active' },
  { id: 3, name: 'Editor', description: 'Can manage content', users: 2, status: 'Active' },
  { id: 4, name: 'Support', description: 'Can view orders & customers', users: 2, status: 'Active' },
  { id: 5, name: 'Inventory Manager', description: 'Can manage products & stock', users: 1, status: 'Inactive' }
];

const ADMINS_DATA = [
  { id: 1, name: 'Sumathi A', email: 'sumathi@happysarees.com', phone: '+91 98765 43210', role: 'Super Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80', lastLogin: '22 Jul 2026, 10:15 AM' },
  { id: 2, name: 'Priya Sharma', email: 'priya@happysarees.com', phone: '+91 91234 56780', role: 'Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80', lastLogin: '21 Jul 2026, 04:30 PM' },
  { id: 3, name: 'Kavya Reddy', email: 'kavya@happysarees.com', phone: '+91 99887 66554', role: 'Editor', status: 'Inactive', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80', lastLogin: '18 Jul 2026, 09:00 AM' }
];

const PERMISSIONS = {
  Dashboard: ['View'], Products: ['View', 'Create', 'Edit', 'Delete'],
  Orders: ['View', 'Update'], Customers: ['View'],
  Coupons: ['Create', 'Edit', 'View'], Reports: ['View'],
  Settings: ['View'], CMS: ['Create', 'Edit', 'View']
};

function AdminManagement() {
  const [toast, fire] = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [admins, setAdmins] = useState(ADMINS_DATA);
  const [roles] = useState(ROLES_DATA);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', role: 'Admin', status: 'Active' });
  const [changePwForm, setChangePwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filteredAdmins = admins.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingAdmin(null);
    setAdminForm({ name: '', email: '', phone: '', role: 'Admin', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({ name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, status: admin.status });
    setShowModal(true);
  };

  const saveAdmin = () => {
    if (!adminForm.name || !adminForm.email) { alert('Name and email are required.'); return; }
    if (editingAdmin) {
      setAdmins(p => p.map(a => a.id === editingAdmin.id ? { ...a, ...adminForm } : a));
      fire('Admin user updated.');
    } else {
      const newAdmin = { ...adminForm, id: Date.now(), avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80', lastLogin: 'Never' };
      setAdmins(p => [newAdmin, ...p]);
      fire('Admin user added.');
    }
    setShowModal(false);
  };

  const deleteAdmin = (id) => {
    if (window.confirm('Delete this admin user?')) {
      setAdmins(p => p.filter(a => a.id !== id));
      fire('Admin user deleted.');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {toast && <div className={styles.toast}><FiCheck /> {toast}</div>}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h4>{editingAdmin ? 'Edit Admin User' : 'Add New Admin User'}</h4>
              <button onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className={styles.modalBody}>
              {[['Full Name', 'name'], ['Email Address', 'email'], ['Phone Number', 'phone']].map(([label, key]) => (
                <div key={key} className={styles.field}>
                  <label className={styles.fieldLabel}>{label}</label>
                  <input className={styles.input} value={adminForm[key]} onChange={e => setAdminForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Role</label>
                <select className={styles.select} value={adminForm.role} onChange={e => setAdminForm(p => ({ ...p, role: e.target.value }))}>
                  {roles.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Status</label>
                <select className={styles.select} value={adminForm.status} onChange={e => setAdminForm(p => ({ ...p, status: e.target.value }))}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.outlineBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={saveAdmin}>Save Admin</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Admin Management</h2>
          <p className={styles.pageDesc}>Manage admin users, roles, and permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        {[['users', 'Admin Users'], ['roles', 'Roles'], ['permissions', 'Permissions'], ['password', 'Change Password']].map(([k, l]) => (
          <button key={k} className={`${styles.tab} ${activeTab === k ? styles.tabActive : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Admin Users" icon={<FiUsers />}
            action={<button className={styles.addBtn} onClick={openAdd}><FiPlus /> Add Admin</button>}
          >
            <div className={styles.searchRow}>
              <input className={styles.input} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '320px' }} />
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <div className={styles.adminCell}>
                        <img src={admin.avatar} alt={admin.name} className={styles.adminAvatar} />
                        <strong>{admin.name}</strong>
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>{admin.phone}</td>
                    <td><span className={styles.rolePill}>{admin.role}</span></td>
                    <td>{admin.lastLogin}</td>
                    <td>
                      <span className={admin.status === 'Active' ? styles.activePill : styles.inactivePill}>
                        {admin.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.iconBtn} onClick={() => openEdit(admin)}><FiEdit2 /></button>
                      <button className={styles.iconBtnDanger} onClick={() => deleteAdmin(admin.id)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SettingsCard>
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Role Management" icon={<FiShield />}
            action={<button className={styles.addBtn} onClick={() => fire('Role builder opening...')}><FiPlus /> Add Role</button>}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.description}</td>
                    <td>{r.users}</td>
                    <td>
                      <span className={r.status === 'Active' ? styles.activePill : styles.inactivePill}>{r.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={styles.iconBtn}><FiEdit2 /></button>
                      <button className={styles.iconBtnDanger}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SettingsCard>
        </div>
      )}

      {/* PERMISSIONS TAB */}
      {activeTab === 'permissions' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Permissions for Admin Role" icon={<FiShield />}>
            <div className={styles.permissionsGrid}>
              {Object.entries(PERMISSIONS).map(([module, perms]) => (
                <div key={module} className={styles.permCard}>
                  <strong className={styles.permModule}>{module}</strong>
                  <div className={styles.permTags}>
                    {perms.map(p => (
                      <span key={p} className={styles.permTag}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      )}

      {/* CHANGE PASSWORD TAB */}
      {activeTab === 'password' && (
        <div className={styles.sectionsStack}>
          <SettingsCard title="Change Admin Password" icon={<FiShield />}>
            <div className={styles.formGrid} style={{ maxWidth: '480px' }}>
              <Field label="Current Password">
                <div className={styles.passwordField}>
                  <input className={styles.input} type={showCurrent ? 'text' : 'password'} value={changePwForm.current} onChange={e => setChangePwForm(p => ({ ...p, current: e.target.value }))} />
                  <button className={styles.eyeBtn} onClick={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </Field>
              <Field label="New Password">
                <div className={styles.passwordField}>
                  <input className={styles.input} type={showNew ? 'text' : 'password'} value={changePwForm.newPw} onChange={e => setChangePwForm(p => ({ ...p, newPw: e.target.value }))} />
                  <button className={styles.eyeBtn} onClick={() => setShowNew(!showNew)}>
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm New Password">
                <input className={styles.input} type="password" value={changePwForm.confirm} onChange={e => setChangePwForm(p => ({ ...p, confirm: e.target.value }))} />
              </Field>
              <button className={styles.saveBtn} style={{ width: 'fit-content' }}
                onClick={() => {
                  if (changePwForm.newPw !== changePwForm.confirm) { alert('Passwords do not match.'); return; }
                  fire('Password changed successfully.');
                  setChangePwForm({ current: '', newPw: '', confirm: '' });
                }}>
                Update Password
              </button>
            </div>
          </SettingsCard>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN SETTINGS ROUTER COMPONENT
═══════════════════════════════════════ */
function Settings() {
  const location = useLocation();
  const sub = location.pathname.replace('/settings', '').replace(/^\//, '') || '';

  const render = () => {
    if (sub === 'website') return <WebsiteSettings />;
    if (sub === 'payments') return <PaymentSettings />;
    if (sub === 'shipping') return <ShippingSettings />;
    if (sub === 'tax') return <TaxSettings />;
    if (sub === 'email') return <EmailSettings />;
    if (sub === 'system') return <SystemSettings />;
    if (sub === 'backup') return <BackupRestore />;
    if (sub === 'admin') return <AdminManagement />;
    return <StoreSettings />;
  };

  return render();
}

export default Settings;
