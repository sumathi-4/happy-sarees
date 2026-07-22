import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import styles from './AddressesTab.module.css';

function AddressesTab({ addresses: initialAddresses = [] }) {
  const [addressList, setAddressList] = useState(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    let isMounted = true;
    api.getAddresses()
      .then((data) => {
        if (isMounted && data.success && data.addresses.length > 0) {
          const formatted = data.addresses.map(a => ({
            id: a.id,
            label: a.is_default ? 'Home' : 'Office',
            isDefault: a.is_default,
            name: a.full_name,
            house: a.street_address,
            street: a.street_address,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            phone: a.phone
          }));
          setAddressList(formatted);
        }
      })
      .catch((err) => {
        console.log('[AddressesTab] Operating with local address list:', err.message);
      });

    return () => { isMounted = false; };
  }, []);

  const handleSave = () => {
    if (!formData.fullName || !formData.phone || !formData.streetAddress || !formData.city || !formData.pincode) return;

    api.addAddress({
      fullName: formData.fullName,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state || 'Tamil Nadu',
      pincode: formData.pincode,
      isDefault: addressList.length === 0
    })
      .then((data) => {
        if (data.success && data.address) {
          const a = data.address;
          setAddressList(prev => [...prev, {
            id: a.id,
            label: 'Home',
            isDefault: a.is_default,
            name: a.full_name,
            house: a.street_address,
            street: a.street_address,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            phone: a.phone
          }]);
        }
      })
      .catch(() => {
        setAddressList(prev => [...prev, {
          id: Date.now(),
          label: 'Home',
          isDefault: false,
          name: formData.fullName,
          house: formData.streetAddress,
          street: formData.streetAddress,
          city: formData.city,
          state: formData.state || 'Tamil Nadu',
          pincode: formData.pincode,
          phone: formData.phone
        }]);
      });

    setShowAddForm(false);
    setFormData({ fullName: '', phone: '', streetAddress: '', city: '', state: '', pincode: '' });
  };

  const handleDelete = (id) => {
    api.deleteAddress(id).catch(() => {});
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
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={styles.inputField}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="Flat / House No & Street Address"
              value={formData.streetAddress}
              onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              className={styles.inputField}
            />
          </div>
          <button onClick={handleSave} className={styles.saveBtn}>
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
                {addr.house}, {addr.city} - {addr.pincode}, {addr.state}
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
