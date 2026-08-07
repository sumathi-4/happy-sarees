import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiHome, FiCreditCard, FiFileText, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/ProductForm.module.css';

const TABS = [
  { id: 'business', label: 'Business Info', icon: <FiUser /> },
  { id: 'address', label: 'Pickup Address', icon: <FiHome /> },
  { id: 'bank', label: 'Bank Account', icon: <FiCreditCard /> },
  { id: 'documents', label: 'Verify Documents', icon: <FiFileText /> }
];

function Profile() {
  const [activeTab, setActiveTab] = useState('business');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();
  
  const watchStoreLogo = watch('storeLogoUrl');
  const watchStoreBanner = watch('storeBannerUrl');

  async function loadProfile() {
    try {
      const res = await sellerApi.getProfile();
      if (res.success && res.profile) {
        const p = res.profile;
        setProfile(p);
        
        setValue('businessName', p.business_name);
        setValue('storeName', p.store_name);
        setValue('ownerName', p.owner_name);
        setValue('phone', p.phone);
        setValue('businessDescription', p.business_description || '');
        setValue('gstin', p.gstin || '');
        setValue('panNumber', p.pan_number || '');
        setValue('storeLogoUrl', p.store_logo_url || '');
        setValue('storeBannerUrl', p.store_banner_url || '');
        setValue('streetAddress', p.street_address || '');
        setValue('city', p.city || '');
        setValue('state', p.state || '');
        setValue('pincode', p.pincode || '');
        setValue('bankAccountName', p.bank_account_name || '');
        setValue('bankAccountNo', p.bank_account_no || '');
        setValue('bankIfsc', p.bank_ifsc || '');
        setValue('bankName', p.bank_name || '');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [setValue]);

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const b64 = await convertToBase64(file);
      setValue('storeLogoUrl', b64);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const b64 = await convertToBase64(file);
      setValue('storeBannerUrl', b64);
    }
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

  if (loading) return <div style={{ padding: '20px' }}>Loading business profile...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Business Profile</h1>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ color: 'var(--success-color)', padding: '12px', background: 'var(--success-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCheckCircle /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
        {/* Profile Tabs */}
        <ul className={styles.tabsList}>
          {TABS.map(tab => (
            <li key={tab.id}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {tab.icon} {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Form Fields */}
        <div className={styles.formBody}>
          
          {activeTab === 'business' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business Legal Name</label>
                <input
                  type="text"
                  disabled
                  style={{ backgroundColor: 'var(--bg-soft-pink-darker)', cursor: 'not-allowed' }}
                  {...register('businessName')}
                />
                <span className={styles.helperText}>Legal name cannot be changed after registration.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Public Store Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Silk Handlooms"
                  {...register('storeName', { required: 'Store name is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Owner Full Name</label>
                <input
                  type="text"
                  {...register('ownerName', { required: 'Owner name is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Phone</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email}
                  style={{ backgroundColor: 'var(--bg-soft-pink-darker)', cursor: 'not-allowed' }}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Brand Story / Description</label>
                <textarea
                  rows={4}
                  {...register('businessDescription')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Store Logo</label>
                <label className={styles.fileUploadBox}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  <FiUpload />
                  <span>Update Logo</span>
                </label>
                {watchStoreLogo && <img src={watchStoreLogo} alt="Logo" className={styles.filePreview} style={{ maxHeight: '60px', width: 'auto', marginTop: '6px' }} />}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Store Banner</label>
                <label className={styles.fileUploadBox}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
                  <FiUpload />
                  <span>Update Banner</span>
                </label>
                {watchStoreBanner && <img src={watchStoreBanner} alt="Banner" className={styles.filePreview} style={{ maxHeight: '60px', width: 'auto', marginTop: '6px' }} />}
              </div>
            </div>
          )}

          {activeTab === 'address' && (
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Pickup Street Address</label>
                <input
                  type="text"
                  {...register('streetAddress', { required: 'Street address is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>State</label>
                <input
                  type="text"
                  {...register('state', { required: 'State is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Pincode</label>
                <input
                  type="text"
                  {...register('pincode', { required: 'Pincode is required' })}
                />
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Account Holder Name</label>
                <input
                  type="text"
                  {...register('bankAccountName', { required: 'Account holder name is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Account Number</label>
                <input
                  type="text"
                  {...register('bankAccountNo', { required: 'Account number is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank IFSC Code</label>
                <input
                  type="text"
                  {...register('bankIfsc', { required: 'IFSC code is required' })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Bank Name</label>
                <input
                  type="text"
                  {...register('bankName', { required: 'Bank name is required' })}
                />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>GSTIN</label>
                <input
                  type="text"
                  {...register('gstin')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>PAN Card Number</label>
                <input
                  type="text"
                  {...register('panNumber', { required: 'PAN is required' })}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ marginTop: '20px' }}>
                <span className={styles.label}>Uploaded Registration Documents</span>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                  {profile?.documents && profile.documents.length > 0 ? (
                    profile.documents.map((d, i) => (
                      <a 
                        key={i} 
                        href={d.fileUrl || d.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '10px 16px', background: 'var(--bg-soft-pink-darker)',
                          borderRadius: '8px', border: '1px solid var(--border-color)',
                          fontSize: '12px', fontWeight: 600
                        }}
                      >
                        <FiFileText style={{ color: 'var(--primary-color)' }} /> {(d.docType || d.doc_type || 'compliance_document').replace(/_/g, ' ').toUpperCase()}
                      </a>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>No document attachments uploaded.</span>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={styles.actionsFooter} style={{ justifyContent: 'flex-end' }}>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? 'Updating...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
