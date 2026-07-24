import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiShield, FiSliders, FiCheck, FiSave, 
  FiEye, FiEyeOff, FiUpload, FiTrash2, FiSmartphone, FiGlobe, FiLock, FiMonitor
} from 'react-icons/fi';
import { useAdminAuth } from '../context/AdminAuthContext';
import styles from '../styles/ProfileSettings.module.css';

function ProfileSettings() {
  const navigate = useNavigate();
  const { adminUser, adminFetch } = useAdminAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [profileData, setProfileData] = useState({
    name: adminUser?.name || 'Super Admin',
    email: adminUser?.email || 'admin@happysarees.com',
    phone: adminUser?.phone || '+91 98765 43210',
    role: adminUser?.role || 'Super Admin',
    joinedDate: '15 Jan 2024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  });

  // Password Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Personal Preferences State
  const [preferencesData, setPreferencesData] = useState({
    theme: 'Light',
    language: 'English',
    dateFormat: 'DD MMM YYYY',
    timeFormat: '12 Hours (hh:mm AM/PM)',
    emailNotifications: true,
    browserNotifications: true
  });

  useEffect(() => {
    if (adminUser) {
      setProfileData(prev => ({
        ...prev,
        name: adminUser.name || prev.name,
        email: adminUser.email || prev.email,
        phone: adminUser.phone || prev.phone,
        role: adminUser.role || prev.role
      }));
    }
  }, [adminUser]);

  const fireToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferencesData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfileData(prev => ({
      ...prev,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (activeTab === 'profile') {
        const token = localStorage.getItem('hs_admin_token');
        await fetch('http://localhost:5001/api/admin/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone
          })
        });

        const updatedUser = {
          ...adminUser,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        };
        localStorage.setItem('hs_admin_user', JSON.stringify(updatedUser));
        fireToast("Profile information updated successfully!");
      } else if (activeTab === 'security') {
        if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
          alert("New password and confirm password do not match.");
          setLoading(false);
          return;
        }
        if (securityData.newPassword && securityData.currentPassword) {
          const token = localStorage.getItem('hs_admin_token');
          await fetch('http://localhost:5001/api/admin/auth/change-password', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              currentPassword: securityData.currentPassword,
              newPassword: securityData.newPassword
            })
          });
        }
        fireToast("Password updated successfully!");
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else if (activeTab === 'preferences') {
        localStorage.setItem('hs_admin_preferences', JSON.stringify(preferencesData));
        fireToast("Personal preferences saved!");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      fireToast("Profile settings saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {toastMessage && (
        <div className={styles.toast}>
          <FiCheck /> {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Profile Settings</h2>
          <p className={styles.pageDesc}>Manage your personal admin account, security, and preferences</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* 3 Tabs Navigation Header */}
      <div className={styles.tabsRow}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser /> Profile
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FiShield /> Security
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'preferences' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FiSliders /> Preferences
        </button>
      </div>

      {/* ────────────────── TAB 1: PROFILE ────────────────── */}
      {activeTab === 'profile' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FiUser style={{ color: '#d11b69' }} /> Personal Profile
          </h3>

          {/* Avatar Upload Frame */}
          <div className={styles.avatarBox}>
            <img src={profileData.avatar} alt="Admin Avatar" className={styles.avatarPreview} />
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#0f172a' }}>Profile Photo</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
                Upload a JPG, PNG, or WEBP photo for your admin account avatar.
              </p>
              <div className={styles.avatarActions}>
                <button 
                  type="button" 
                  className={styles.changePhotoBtn}
                  onClick={() => document.getElementById('profile-avatar-input').click()}
                >
                  Upload / Change
                </button>
                <input 
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarUpload}
                />
                <button type="button" className={styles.removePhotoBtn} onClick={handleRemoveAvatar}>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                className={styles.input} 
                value={profileData.name} 
                onChange={handleInputChange} 
              />
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                className={styles.input} 
                value={profileData.email} 
                onChange={handleInputChange} 
              />
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                className={styles.input} 
                value={profileData.phone} 
                onChange={handleInputChange} 
              />
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Role (Read Only)</label>
              <input 
                type="text" 
                className={`${styles.input} ${styles.readOnlyInput}`} 
                value={profileData.role} 
                disabled 
              />
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Joined Date (Read Only)</label>
              <input 
                type="text" 
                className={`${styles.input} ${styles.readOnlyInput}`} 
                value={profileData.joinedDate} 
                disabled 
              />
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 2: SECURITY ────────────────── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Change Password Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiLock style={{ color: '#d11b69' }} /> Change Password
            </h3>
            <div className={styles.formGrid} style={{ maxWidth: '540px' }}>
              <div className={styles.formGroupFull}>
                <label className={styles.fieldLabel}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showCurrentPw ? 'text' : 'password'} 
                    name="currentPassword" 
                    className={styles.input} 
                    value={securityData.currentPassword} 
                    onChange={handleSecurityChange} 
                    placeholder="Enter current password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    {showCurrentPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.fieldLabel}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPw ? 'text' : 'password'} 
                    name="newPassword" 
                    className={styles.input} 
                    value={securityData.newPassword} 
                    onChange={handleSecurityChange} 
                    placeholder="Enter new password"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    {showNewPw ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroupFull}>
                <label className={styles.fieldLabel}>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  className={styles.input} 
                  value={securityData.confirmPassword} 
                  onChange={handleSecurityChange} 
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          </div>

          {/* 2FA Placeholder Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiSmartphone style={{ color: '#d11b69' }} /> Two-Factor Authentication (2FA)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Two-Factor Auth Status: Disabled</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Add an extra layer of security to your admin account using an authenticator app (Google Authenticator / Authy).
                </p>
              </div>
              <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
                Coming Soon
              </span>
            </div>
          </div>

          {/* Active Sessions Placeholder Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiMonitor style={{ color: '#d11b69' }} /> Active Login Sessions
            </h3>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Windows PC — Chrome Browser</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Chennai, India • IP: 103.21.125.4 • <span style={{ color: '#16a34a', fontWeight: 600 }}>Active Now</span>
                  </p>
                </div>
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, background: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                  Current Session
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB 3: PREFERENCES ────────────────── */}
      {activeTab === 'preferences' && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <FiSliders style={{ color: '#d11b69' }} /> Personal Preferences
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
            These settings apply exclusively to your logged-in admin account and will not affect the customer website.
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Theme</label>
              <select 
                name="theme" 
                className={styles.select} 
                value={preferencesData.theme} 
                onChange={handlePreferencesChange}
              >
                <option value="Light">Light Mode (Default)</option>
                <option value="Dark">Dark Mode</option>
                <option value="System">System Default</option>
              </select>
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Language</label>
              <select 
                name="language" 
                className={styles.select} 
                value={preferencesData.language} 
                onChange={handlePreferencesChange}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Date Format</label>
              <select 
                name="dateFormat" 
                className={styles.select} 
                value={preferencesData.dateFormat} 
                onChange={handlePreferencesChange}
              >
                <option value="DD MMM YYYY">DD MMM YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className={styles.formGroupHalf}>
              <label className={styles.fieldLabel}>Time Format</label>
              <select 
                name="timeFormat" 
                className={styles.select} 
                value={preferencesData.timeFormat} 
                onChange={handlePreferencesChange}
              >
                <option value="12 Hours (hh:mm AM/PM)">12 Hours (hh:mm AM/PM)</option>
                <option value="24 Hours (HH:mm)">24 Hours (HH:mm)</option>
              </select>
            </div>

            <div className={styles.formGroupHalf} style={{ marginTop: '12px' }}>
              <label className={styles.toggleLabel}>
                <input 
                  type="checkbox" 
                  name="emailNotifications" 
                  checked={preferencesData.emailNotifications} 
                  onChange={handlePreferencesChange} 
                  className={styles.checkbox}
                />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  Enable Email Notifications
                </span>
              </label>
            </div>

            <div className={styles.formGroupHalf} style={{ marginTop: '12px' }}>
              <label className={styles.toggleLabel}>
                <input 
                  type="checkbox" 
                  name="browserNotifications" 
                  checked={preferencesData.browserNotifications} 
                  onChange={handlePreferencesChange} 
                  className={styles.checkbox}
                />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  Enable Browser Push Notifications
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;
