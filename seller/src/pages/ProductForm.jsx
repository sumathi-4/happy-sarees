import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiArrowLeft, FiUpload, FiTrash, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { sellerApi } from '../api/sellerApi';
import styles from '../styles/ProductForm.module.css';

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'attributes', label: 'Saree Attributes' },
  { id: 'pricing', label: 'Pricing & Inventory' },
  { id: 'gallery', label: 'Media Gallery' },
  { id: 'shipping', label: 'Shipping Specs' },
  { id: 'seo', label: 'SEO Tags' }
];

function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState([]);
  const [masterTypes, setMasterTypes] = useState([]);
  const [masterData, setMasterData] = useState({});
  const [images, setImages] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({
    defaultValues: {
      blouseIncluded: true,
      height: '5.5m',
      width: '1.1m'
    }
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await sellerApi.getCategories();
        if (res.success) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadMasterConfig() {
      try {
        const [typesRes, dataRes] = await Promise.all([
          fetch('http://localhost:5001/api/cms/spec-types').then(r => r.json()),
          fetch('http://localhost:5001/api/cms/master-data').then(r => r.json())
        ]);
        if (typesRes.success && Array.isArray(typesRes.types)) {
          setMasterTypes(typesRes.types);
        }
        if (dataRes.success && dataRes.masterData) {
          setMasterData(dataRes.masterData);
        }
      } catch (err) {
        console.error('Failed to load master data config:', err);
      }
    }
    loadMasterConfig();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (!isEdit) return;
      try {
        const res = await sellerApi.getProductById(id);
        if (res.success && res.product) {
          const p = res.product;
          setValue('name', p.name);
          setValue('categoryId', p.categoryId || '');
          setValue('description', p.description);
          setValue('sku', p.sku);
          setValue('fabric', p.fabric);
          setValue('color', p.color);
          setValue('weave', p.weave);
          setValue('border', p.border);
          setValue('pallu', p.pallu);
          setValue('occasion', p.occasion);
          setValue('blouseIncluded', p.blouseIncluded);
          setValue('blouseSize', p.blouseSize || '');
          setValue('height', p.height);
          setValue('width', p.width);
          setValue('weight', p.weight || '');
          setValue('price', p.price);
          setValue('originalPrice', p.originalPrice || '');
          setValue('stockCount', p.stockCount);
          if (p.images) {
            setImages(p.images);
          }
        } else {
          setErrorMsg('Failed to pre-populate product information.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'An error occurred loading product.');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id, isEdit, setValue]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index, direction) => {
    if (direction === 'left' && index > 0) {
      setImages(prev => {
        const copy = [...prev];
        const temp = copy[index - 1];
        copy[index - 1] = copy[index];
        copy[index] = temp;
        return copy;
      });
    } else if (direction === 'right' && index < images.length - 1) {
      setImages(prev => {
        const copy = [...prev];
        const temp = copy[index + 1];
        copy[index + 1] = copy[index];
        copy[index] = temp;
        return copy;
      });
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setErrorMsg('');

    // Attach images
    const payload = {
      ...data,
      images
    };

    try {
      let res;
      if (isEdit) {
        res = await sellerApi.updateProduct(id, payload);
      } else {
        res = await sellerApi.createProduct(payload);
      }

      if (res.success) {
        navigate('/products');
      } else {
        setErrorMsg(res.message || 'Failed to save product.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading saree catalog files...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <button className={styles.backBtn} onClick={() => navigate('/products')}>
          <FiArrowLeft />
        </button>
        <h1 className={styles.title}>{isEdit ? 'Edit Saree Details' : 'List New Saree'}</h1>
      </div>

      {errorMsg && (
        <div style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--error-bg)', borderRadius: '8px' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formCard}>
        {/* Tab Headers */}
        <ul className={styles.tabsList}>
          {TABS.map(tab => (
            <li key={tab.id}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Contents */}
        <div className={styles.formBody}>
          
          {activeTab === 'basic' && (
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Saree Name <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Kanchipuram Pure Zari Silk Saree"
                  className={errors.name ? styles.inputError : ''}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category <span className={styles.required}>*</span></label>
                <select 
                  className={errors.categoryId ? styles.inputError : ''}
                  {...register('categoryId', { required: 'Category is required' })}
                >
                  <option value="">Select Saree Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className={styles.errorText}>{errors.categoryId.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>SKU / Model ID</label>
                <input
                  type="text"
                  placeholder="Leave empty for auto-generation"
                  {...register('sku')}
                />
                <span className={styles.helperText}>Unique identifier for store inventory tracking.</span>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Product Description <span className={styles.required}>*</span></label>
                <textarea
                  placeholder="Provide a luxurious description of the weaving, borders, fabric texture, and accessory instructions..."
                  rows={6}
                  className={errors.description ? styles.inputError : ''}
                  {...register('description', { required: 'Description is required' })}
                />
                {errors.description && <span className={styles.errorText}>{errors.description.message}</span>}
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className={styles.grid}>
              {masterTypes && masterTypes.length > 0 ? (
                <>
                  {masterTypes.map((t) => {
                    const typeKey = t.slug;
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
                    const nameAttr = fieldNameMap[typeKey] || typeKey;

                    const clean = String(typeKey).toLowerCase().trim();
                    const plural = clean.endsWith('s') ? clean : clean + 's';
                    const singular = clean.endsWith('s') ? clean.slice(0, -1) : clean;
                    const items = masterData[plural] || masterData[singular] || [];

                    const isRequired = ['fabric', 'color', 'occasion'].includes(nameAttr);

                    return (
                      <div className={styles.formGroup} key={t.id}>
                        <label className={styles.label}>
                          {t.name} {isRequired && <span className={styles.required}>*</span>}
                        </label>
                        <select
                          className={errors[nameAttr] ? styles.inputError : ''}
                          {...register(nameAttr, isRequired ? { required: `${t.name} is required` } : {})}
                        >
                          <option value="">Select {t.name}</option>
                          {items.map((item, idx) => {
                            const val = typeof item === 'string' ? item : item.name;
                            return (
                              <option key={idx} value={val}>{val}</option>
                            );
                          })}
                        </select>
                        {errors[nameAttr] && <span className={styles.errorText}>{errors[nameAttr].message}</span>}
                      </div>
                    );
                  })}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Pallu Design</label>
                    <input
                      type="text"
                      placeholder="e.g. Floral Zari Work, Tassels"
                      {...register('pallu')}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fabric Weaving <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Mulberry Silk, Georgette, Linen"
                      className={errors.fabric ? styles.inputError : ''}
                      {...register('fabric', { required: 'Fabric is required' })}
                    />
                    {errors.fabric && <span className={styles.errorText}>{errors.fabric.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Saree Main Color <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Crimson Red, Mustard Gold"
                      className={errors.color ? styles.inputError : ''}
                      {...register('color', { required: 'Color is required' })}
                    />
                    {errors.color && <span className={styles.errorText}>{errors.color.message}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Weave Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Jacquard, Brocade, Jamdani"
                      {...register('weave')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Border Styling</label>
                    <input
                      type="text"
                      placeholder="e.g. Temple Border, Zari Border"
                      {...register('border')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Pallu Design</label>
                    <input
                      type="text"
                      placeholder="e.g. Floral Zari Work, Tassels"
                      {...register('pallu')}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Occasion Suitability</label>
                    <input
                      type="text"
                      placeholder="e.g. Bridal, Festive, Cocktail Party"
                      {...register('occasion')}
                    />
                  </div>
                </>
              )}
              
              <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    {...register('blouseIncluded')}
                  />
                  <span>Unstitched Blouse Piece Included</span>
                </label>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Blouse Size / Length</label>
                <input
                  type="text"
                  placeholder="e.g. 80cm, 1 meter"
                  {...register('blouseSize')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Saree Length (Height)</label>
                <input
                  type="text"
                  placeholder="e.g. 5.5m"
                  {...register('height')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Saree Width</label>
                <input
                  type="text"
                  placeholder="e.g. 1.1m"
                  {...register('width')}
                />
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Selling Price (INR) <span className={styles.required}>*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 16335"
                  className={errors.price ? styles.inputError : ''}
                  {...register('price', { required: 'Price is required', min: 1 })}
                />
                {errors.price && <span className={styles.errorText}>{errors.price.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>MRP / Original Price (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 21780"
                  {...register('originalPrice')}
                />
                <span className={styles.helperText}>Shows a strike-through discount price if higher than Selling Price.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Stock Quantity <span className={styles.required}>*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  className={errors.stockCount ? styles.inputError : ''}
                  {...register('stockCount', { required: 'Stock count is required', min: 0 })}
                />
                {errors.stockCount && <span className={styles.errorText}>{errors.stockCount.message}</span>}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <span className={styles.label}>Media Files</span>
              <p className={styles.helperText} style={{ marginBottom: '16px' }}>Upload high-resolution images of the saree. The first image will be set as the catalog cover.</p>
              
              <div className={styles.mediaGrid}>
                {images.map((img, i) => (
                  <div key={i} className={styles.mediaCard}>
                    <img src={img} alt={`Angle ${i+1}`} className={styles.mediaImg} />
                    {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                    
                    <div className={styles.imageActions}>
                      {i > 0 && (
                        <button type="button" className={styles.imageActionBtn} onClick={() => handleMoveImage(i, 'left')} title="Move Left">
                          <FiChevronLeft />
                        </button>
                      )}
                      {i < images.length - 1 && (
                        <button type="button" className={styles.imageActionBtn} onClick={() => handleMoveImage(i, 'right')} title="Move Right">
                          <FiChevronRight />
                        </button>
                      )}
                      <button type="button" className={styles.imageActionBtn} onClick={() => handleRemoveImage(i)} title="Remove Image" style={{ color: 'var(--error-color)' }}>
                        <FiTrash />
                      </button>
                    </div>
                  </div>
                ))}

                <label className={`${styles.mediaCard} ${styles.uploadCard}`}>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  <FiUpload style={{ fontSize: '24px' }} />
                  <span>Upload Image</span>
                </label>
              </div>

              <div className={styles.urlInputGroup}>
                <input
                  type="text"
                  placeholder="Or paste an image URL directly..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                />
                <button type="button" className={styles.btnSecondary} onClick={handleAddImageUrl}>
                  Add URL
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Package Weight (grams)</label>
                <input
                  type="number"
                  placeholder="e.g. 600"
                  {...register('weight')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Standard Lead Time (Days)</label>
                <select defaultValue="2">
                  <option value="1">1 Day Dispatch</option>
                  <option value="2">2 Days Dispatch</option>
                  <option value="3">3 Days Dispatch</option>
                  <option value="5">5 Days (Custom Weaving)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className={styles.grid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Meta SEO Title</label>
                <input
                  type="text"
                  placeholder="e.g. Buy Royal Crimson Red Kanchipuram Silk Saree Online"
                  {...register('seoTitle')}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Meta SEO Description</label>
                <textarea
                  placeholder="Short, keyword-rich snippet for Google search results page..."
                  rows={3}
                  {...register('metaDescription')}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={styles.actionsFooter}>
          <div>
            {errors && Object.keys(errors).length > 0 && (
              <span className={styles.errorText} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertCircle /> Form has validation errors. Review tabs.
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button type="button" className={styles.btnSecondary} onClick={() => navigate('/products')} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Submit for Approval')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
