import React, { useState } from 'react';
import { FiMapPin, FiPlus, FiCheck } from 'react-icons/fi';
import styles from './AddressStep.module.css';

function AddressStep({ addresses = [], selectedAddressId, onSelectAddress, onAddAddress, onNextStep }) {
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    house: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    saveAddress: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveAndGetAddress = () => {
    if (!formData.name || !formData.phone || !formData.pincode || !formData.city || (!formData.house && !formData.street)) {
      return null;
    }
    const newAddress = {
      id: `addr_${Date.now()}`,
      label: 'Home',
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      house: formData.house || '',
      street: `${formData.street || ''} ${formData.area || ''}`.trim() || formData.house,
      city: formData.city,
      state: formData.state || 'Tamil Nadu',
      pincode: formData.pincode,
      isDefault: addresses.length === 0
    };
    if (onAddAddress) {
      onAddAddress(newAddress);
    } else {
      onSelectAddress(newAddress.id);
    }
    setShowAddForm(false);
    return newAddress;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const saved = saveAndGetAddress();
    if (!saved) {
      alert('Please fill in mandatory fields: Full Name, Mobile Number, House/Street, City, Pincode.');
    }
  };

  const handleNextClick = () => {
    if (showAddForm) {
      if (formData.name || formData.phone || formData.house || formData.city || formData.pincode) {
        const saved = saveAndGetAddress();
        if (!saved) {
          alert('Please fill in mandatory fields: Full Name, Mobile Number, House/Street, City, Pincode.');
          return;
        }
        onNextStep();
        return;
      }
    }

    if (!selectedAddressId || addresses.length === 0) {
      alert('Please enter or select a valid shipping address to continue.');
      return;
    }

    const currentSelected = addresses.find(a => a.id === selectedAddressId);
    if (!currentSelected) {
      alert('Please select a valid shipping address to continue.');
      return;
    }

    onNextStep();
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <span className={styles.stepNum}>1</span>
          <h3 className={styles.stepTitle}>
            <FiMapPin className={styles.titleIcon} /> Shipping Address
          </h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={styles.addBtn}
        >
          <FiPlus /> {showAddForm ? 'Select Saved Address' : 'Add New Address'}
        </button>
      </div>

      {!showAddForm ? (
        <div className={styles.addressGrid}>
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;

            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`${styles.addrCard} ${isSelected ? styles.selectedCard : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.radioGroup}>
                    <input
                      type="radio"
                      name="shipping_address"
                      checked={isSelected}
                      onChange={() => onSelectAddress(addr.id)}
                      className={styles.radio}
                    />
                    <strong className={styles.label}>{addr.label}</strong>
                    {addr.isDefault && <span className={styles.defaultTag}>Default</span>}
                  </div>
                  {isSelected && <FiCheck className={styles.selectedIcon} />}
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.name}>{addr.name}</p>
                  <p className={styles.street}>
                    {addr.house}, {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city} - {addr.pincode}, {addr.state}
                  </p>
                  <p className={styles.phone}>Phone: {addr.phone}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleFormSubmit} className={styles.addressForm}>
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
              />
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="saveAddress"
              checked={formData.saveAddress}
              onChange={handleInputChange}
            />
            Save this address for future orders
          </label>

          <button type="submit" className={styles.saveAddressBtn}>
            Save & Deliver Here
          </button>
        </form>
      )}

      <div className={styles.footerRow}>
        <button onClick={handleNextClick} className={styles.nextBtn}>
          Continue to Delivery Options
        </button>
      </div>
    </div>
  );
}

export default AddressStep;
