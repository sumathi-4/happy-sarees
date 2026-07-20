import React, { useState } from 'react';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './AddressesTab.module.css';

function AddressesTab({ addresses = [] }) {
  const [addressList, setAddressList] = useState(addresses);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = (id) => {
    setAddressList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.tabTitle}>Saved Addresses</h2>
          <span className={styles.subCount}>{addressList.length} Addresses Saved</span>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className={styles.addBtn}>
          <FiPlus /> {showAddForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.formBox}>
          <h4>Add New Delivery Address</h4>
          <div className={styles.formGrid}>
            <input type="text" placeholder="Full Name" className={styles.inputField} />
            <input type="tel" placeholder="Mobile Number" className={styles.inputField} />
            <input type="text" placeholder="Flat / House No" className={styles.inputField} />
            <input type="text" placeholder="Street / Landmark" className={styles.inputField} />
            <input type="text" placeholder="City" className={styles.inputField} />
            <input type="text" placeholder="Pincode" className={styles.inputField} />
          </div>
          <button onClick={() => setShowAddForm(false)} className={styles.saveBtn}>
            Save Address
          </button>
        </div>
      )}

      <div className={styles.addressGrid}>
        {addressList.map((addr) => (
          <div key={addr.id} className={styles.addrCard}>
            <div className={styles.cardHeader}>
              <div className={styles.labelRow}>
                <FiMapPin className={styles.pinIcon} />
                <strong className={styles.label}>{addr.label}</strong>
                {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
              </div>
              <div className={styles.actionBtns}>
                <button className={styles.actionIconBtn} title="Edit Address">
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className={styles.actionIconBtn}
                  title="Delete Address"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.name}>{addr.name}</p>
              <p className={styles.address}>
                {addr.house}, {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city} - {addr.pincode}, {addr.state}
              </p>
              <span className={styles.phone}>Phone: {addr.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddressesTab;
