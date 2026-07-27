import React, { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import api from '../../services/api';
import styles from './AddressesTab.module.css';

function AddressesTab() {
  const [addressList, setAddressList] = useState(() => {
    try {
      const saved = localStorage.getItem('hs_user_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    house: '',
    street: '',
    landmark: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: ''
  });

  const fetchAddresses = () => {
    api.getAddresses()
      .then((data) => {
        if (data.success && Array.isArray(data.addresses)) {
          const formatted = data.addresses.map(a => ({
            id: a.id,
            label: a.is_default ? 'Home' : 'Address',
            isDefault: a.is_default,
            name: a.full_name || a.name || 'Customer Address',
            house: a.street_address || a.house || '',
            street: a.street_address || a.street || '',
            landmark: a.landmark || '',
            city: a.city || '',
            state: a.state || 'Tamil Nadu',
            pincode: a.pincode || '',
            phone: a.phone || '',
            email: a.email || ''
          }));
          setAddressList(formatted);
          try {
            localStorage.setItem('hs_user_addresses', JSON.stringify(formatted));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.log('[AddressesTab] Live fetch warning:', err.message);
      });
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.pincode || !formData.city) {
      alert('Please fill in required fields (Full Name, Mobile Number, City, Pincode).');
      return;
    }

    const payload = {
      fullName: formData.name,
      phone: formData.phone,
      email: formData.email,
      streetAddress: `${formData.house ? formData.house + ', ' : ''}${formData.street || ''}${formData.landmark ? ', ' + formData.landmark : ''}`.trim(),
      city: formData.city,
      state: formData.state || 'Tamil Nadu',
      pincode: formData.pincode,
      isDefault: addressList.length === 0
    };

    api.addAddress(payload)
      .then((data) => {
        if (data.success && data.address) {
          const added = {
            id: data.address.id,
            label: data.address.is_default ? 'Home' : 'Address',
            isDefault: data.address.is_default,
            name: data.address.full_name || formData.name,
            house: formData.house || data.address.street_address,
            street: formData.street || data.address.street_address,
            landmark: formData.landmark || '',
            city: data.address.city || formData.city,
            state: data.address.state || formData.state,
            pincode: data.address.pincode || formData.pincode,
            phone: data.address.phone || formData.phone,
            email: formData.email
          };
          const updated = [added, ...addressList];
          setAddressList(updated);
          try {
            localStorage.setItem('hs_user_addresses', JSON.stringify(updated));
          } catch (e) {}
        } else {
          fetchAddresses();
        }
      })
      .catch(() => {
        const fallbackId = `addr_${Date.now()}`;
        const newLocal = {
          id: fallbackId,
          label: 'Home',
          isDefault: addressList.length === 0,
          name: formData.name,
          house: formData.house,
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state || 'Tamil Nadu',
          pincode: formData.pincode,
          phone: formData.phone,
          email: formData.email
        };
        const updated = [newLocal, ...addressList];
        setAddressList(updated);
        try {
          localStorage.setItem('hs_user_addresses', JSON.stringify(updated));
        } catch (e) {}
      });

    setShowAddForm(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      house: '',
      street: '',
      landmark: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      api.deleteAddress(id).catch(() => {});
      const updated = addressList.filter((a) => a.id !== id);
      setAddressList(updated);
      try {
        localStorage.setItem('hs_user_addresses', JSON.stringify(updated));
      } catch (e) {}
    }
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
          <h4 className={styles.formTitle}>Add New Delivery Address</h4>
          <form onSubmit={handleSave} className={styles.addressForm}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="ananya@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>House / Flat / Building *</label>
                <input
                  type="text"
                  name="house"
                  required
                  placeholder="123, Anna Nagar 2nd Street"
                  value={formData.house}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Street / Area</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Bodinayakanur"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="Near Lotus Park"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Theni"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Tamil Nadu"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="625513"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn}>
                Save Address
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showAddForm && (
        <div className={styles.addressGrid}>
          {addressList.length > 0 ? (
            addressList.map((addr) => (
              <div key={addr.id} className={styles.addrCard}>
                <div className={styles.cardHeader}>
                  <strong className={styles.label}>{addr.label || 'Home'}</strong>
                  {addr.isDefault && <span className={styles.defaultTag}>Default</span>}
                  <button onClick={() => handleDelete(addr.id)} className={styles.deleteBtn} title="Delete Address">
                    <FiTrash2 />
                  </button>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.name}>{addr.name}</p>
                  <p className={styles.street}>
                    {addr.house || addr.street}{addr.street && addr.house !== addr.street ? `, ${addr.street}` : ''}{addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city} - {addr.pincode}, {addr.state}
                  </p>
                  <p className={styles.phone}>Phone: {addr.phone}</p>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FiMapPin className={styles.emptyIcon} />
              <p>No saved addresses found. Add a delivery address for fast checkout!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AddressesTab;
