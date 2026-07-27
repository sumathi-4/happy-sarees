import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiSave } from 'react-icons/fi';
import styles from './ProfileTab.module.css';

function ProfileTab({ userProfile }) {
  const [profileData, setProfileData] = useState({ ...userProfile });

  useEffect(() => {
    if (userProfile) {
      setProfileData({ ...userProfile });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Personal information updated successfully!');
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <h2 className={styles.tabTitle}>Personal Information</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label>Full Name</label>
          <div className={styles.inputWrapper}>
            <FiUser className={styles.icon} />
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Mobile Number</label>
          <div className={styles.inputWrapper}>
            <FiPhone className={styles.icon} />
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Date of Birth</label>
          <div className={styles.inputWrapper}>
            <FiCalendar className={styles.icon} />
            <input
              type="date"
              name="dob"
              value={profileData.dob}
              onChange={handleChange}
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Gender</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleChange}
            className={styles.selectField}
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.fullWidth}>
          <button type="submit" className={styles.saveBtn}>
            <FiSave /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfileTab;
