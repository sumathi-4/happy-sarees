import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiHome, FiCreditCard, FiFileText, FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/Profile.module.css';

const TABS = [
  { id: 'business', label: 'Business Info',    icon: <FiUser /> },
  { id: 'address',  label: 'Pickup Address',   icon: <FiHome /> },
  { id: 'bank',     label: 'Bank Account',      icon: <FiCreditCard /> },
  { id: 'documents',label: 'Verify Documents', icon: <FiFileText /> }
];

function Profile() {
  const [activeTab, setActiveTab] = useState('business');
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
  const watchStoreLogo   = watch('storeLogoUrl');
  const watchStoreBanner = watch('storeBannerUrl');

  async function loadProfile() {
    try {
      const res = await sellerApi.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setProfile(p);
        setValue('businessName',        p.business_name);
        setValue('storeName',           p.store_name);
        setValue('ownerName',           p.owner_name);
        setValue('phone',               p.phone);
        setValue('businessDescription', p.business_description || '');
        setValue('gstin',               p.gstin || '');
        setValue('panNumber',           p.pan_number || '');
        setValue('storeLogoUrl',        p.store_logo_url || '');
        setValue('storeBannerUrl',      p.store_banner_url || '');
        setValue('streetAddress',       p.street_address || '');
        setValue('city',                p.city || '');
        setValue('state',               p.state || '');
        setValue('pincode',             p.pincode || '');
        setValue('bankAccountName',     p.bank_account_name || '');
        setValue('bankAccountNo',       p.bank_account_no || '');
        setValue('bankIfsc',            p.bank_ifsc || '');
        setValue('bankName',            p.bank_name || '');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, [setValue]);

  const convertToBase64 = (file) =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) setValue('storeLogoUrl', await convertToBase64(file));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) setValue('storeBannerUrl', await convertToBase64(file));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await sellerApi.updateProfile(data);
      if (res.success) {
        setSuccessMsg('Business profile details updated successfully.');
        loadProfile();
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
      Loading business profile…
    </div>
  );

  return (
    <div className={styles.container}>

      {/* ── Page Header ── */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>Seller Portal</span>
          <h1 className={styles.title}>Business Profile</h1>
          <p className={styles.subtitle}>Manage your store details, address, banking, and documents.</p>
        </div>
      </div>

      {errorMsg && (
        <div className={styles.errorBanner}>
          <FiAlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className={styles.successBanner}>
          <FiCheckCircle size={16} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>

        {/* ── Horizontal Tab Bar ── */}
        <div className={styles.tabsBar}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Form Body ── */}
        <div className={styles.formBody}>

          {/* Business Info */}
          {activeTab === 'business' && (
            <div className={styles.grid}>

              <div className={styles.formGroup}>
                <label className={styles.label}>Business Legal Name</label>
                <input
                  type="text"
                  disabled
                  style={{ backgroundColor: 'rgba(43,18,32,0.04)', cursor: 'not-allowed' }}
                  {...register('businessName')}
                />
                <span className={styles.helperText}>Legal name cannot be changed after registration.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Public Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Silk Handlooms"
                  className={errors.storeName ? styles.inputError : ''}
                  {...register('storeName', { required: 'Store name is required' })}
                />
                {errors.storeName && <span className={styles.errorText}>{errors.storeName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Owner Full Name</label>
                <input
                  type="text"
                  className={errors.ownerName ? styles.inputError : ''}
                  {...register('ownerName', { required: 'Owner name is required' })}
                />
                {errors.ownerName && <span className={styles.errorText}>{errors.ownerName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Phone</label>
                <input
                  type="tel"
                  className={errors.phone ? styles.inputError : ''}
                  {...register('phone', { required: 'Phone is required' })}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  style={{ backgroundColor: 'rgba(43,18,32,0.04)', cursor: 'not-allowed' }}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Brand Story / Description</label>
                <textarea rows={4} {...register('businessDescription')} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Store Logo</label>
                <label className={styles.fileUploadBtn}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  <FiUpload size={15} />
                  <span>Update Logo</span>
                </label>
                {watchStoreLogo && (
                  <div className={styles.imagePreview}>
                    <img src={watchStoreLogo} alt="Store Logo" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Store Banner</label>
                <label className={styles.fileUploadBtn}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                  <FiUpload size={15} />
                  <span>Update Banner</span>
                </label>
                {watchStoreBanner && (
                  <div className={styles.imagePreview}>
                    <img src={watchStoreBanner} alt="Store Banner" style={{ maxWidth: '200px', maxHeight: '60px' }} />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Pickup Address */}
          {activeTab === 'address' && (
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Pickup Street Address</label>
                <input
                  type="text"
                  className={errors.streetAddress ? styles.inputError : ''}
                  {...register('streetAddress', { required: 'Street address is required' })}
                />
                {errors.streetAddress && <span className={styles.errorText}>{errors.streetAddress.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  className={errors.city ? styles.inputError : ''}
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && <span className={styles.errorText}>{errors.city.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>State</label>
                <input
                  type="text"
                  className={errors.state ? styles.inputError : ''}
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <span className={styles.errorText}>{errors.state.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pincode</label>
                <input
                  type="text"
                  className={errors.pincode ? styles.inputError : ''}
                  {...register('pincode', { required: 'Pincode is required' })}
                />
                {errors.pincode && <span className={styles.errorText}>{errors.pincode.message}</span>}
              </div>
            </div>
          )}

          {/* Bank Account */}
          {activeTab === 'bank' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Account Holder Name</label>
                <input
                  type="text"
                  className={errors.bankAccountName ? styles.inputError : ''}
                  {...register('bankAccountName', { required: 'Account holder name is required' })}
                />
                {errors.bankAccountName && <span className={styles.errorText}>{errors.bankAccountName.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Account Number</label>
                <input
                  type="text"
                  className={errors.bankAccountNo ? styles.inputError : ''}
                  {...register('bankAccountNo', { required: 'Account number is required' })}
                />
                {errors.bankAccountNo && <span className={styles.errorText}>{errors.bankAccountNo.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank IFSC Code</label>
                <input
                  type="text"
                  className={errors.bankIfsc ? styles.inputError : ''}
                  {...register('bankIfsc', { required: 'IFSC code is required' })}
                />
                {errors.bankIfsc && <span className={styles.errorText}>{errors.bankIfsc.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Name</label>
                <input
                  type="text"
                  className={errors.bankName ? styles.inputError : ''}
                  {...register('bankName', { required: 'Bank name is required' })}
                />
                {errors.bankName && <span className={styles.errorText}>{errors.bankName.message}</span>}
              </div>
            </div>
          )}

          {/* Verify Documents */}
          {activeTab === 'documents' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>GSTIN</label>
                <input type="text" {...register('gstin')} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>PAN Card Number</label>
                <input
                  type="text"
                  className={errors.panNumber ? styles.inputError : ''}
                  {...register('panNumber', { required: 'PAN is required' })}
                />
                {errors.panNumber && <span className={styles.errorText}>{errors.panNumber.message}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: '8px' }}>
                <label className={styles.label}>Uploaded Registration Documents</label>
                <div className={styles.docList}>
                  {profile?.documents && profile.documents.length > 0 ? (
                    profile.documents.map((d, i) => (
                      <a
                        key={i}
                        href={d.fileUrl || d.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.docChip}
                      >
                        <FiFileText style={{ color: 'var(--primary-color)' }} />
                        {(d.docType || d.doc_type || 'compliance_document').replace(/_/g, ' ').toUpperCase()}
                      </a>
                    ))
                  ) : (
                    <div className={styles.docEmpty}>No document attachments uploaded.</div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer Actions ── */}
        <div className={styles.actionsFooter}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? 'Updating…' : 'Save Profile Details'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default Profile;
