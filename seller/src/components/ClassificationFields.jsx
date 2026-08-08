import React from 'react';

function ClassificationFields({ formData, setFormData, masterTypes = [], masterItems = [], formGroupClass = '', selectClass = '' }) {
  // Map singular names for backend fields compatibility
  const fieldNameMap = {
    fabrics: 'fabric',
    occasions: 'occasion',
    colors: 'color',
    patterns: 'pattern',
    weaves: 'weave',
    borders: 'border',
    brands: 'brand',
    brand: 'brand',
    collections: 'collection'
  };

  const handleChange = (typeSlug, nameAttr, value) => {
    setFormData(prev => ({
      ...prev,
      [typeSlug]: value,
      [nameAttr]: value,
      customMasterData: {
        ...(prev.customMasterData || {}),
        [typeSlug]: value,
        [nameAttr]: value
      }
    }));
  };

  return (
    <>
      {(masterTypes || []).filter(t => t.isActive).map((t) => {
        const typeKey = t.slug;
        const typeLabel = t.name;
        const items = (masterItems || []).filter(item => item.typeId === t.id && item.isActive);
        const nameAttr = fieldNameMap[typeKey] || typeKey;
        const selectedVal = formData[nameAttr] || formData[typeKey] || formData.customMasterData?.[typeKey] || '';

        return (
          <div className={formGroupClass} key={t.id}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{typeLabel}</label>
            <select
              className={selectClass}
              name={nameAttr}
              value={selectedVal}
              onChange={(e) => handleChange(typeKey, nameAttr, e.target.value)}
            >
              <option value="">Select {typeLabel}</option>
              {items.map(item => (
                <option key={item.id || item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </>
  );
}

export default ClassificationFields;
