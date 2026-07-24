import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiCheck, FiImage, FiTrash2, 
  FiFileText, FiTag, FiDollarSign, FiBookOpen, 
  FiCompass, FiSettings, FiPlus, FiVideo, FiUpload, FiLink,
  FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/ProductForm.module.css';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { products, addProduct, updateProduct, masterData } = useAdminData();

  // Active Tab state (7 Steps)
  const [activeTab, setActiveTab] = useState('basic');

  // Video Input Mode state: 'upload' | 'url'
  const [videoMode, setVideoMode] = useState('upload');

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    longDescription: '',
    status: 'Draft',
    fabric: '',
    occasion: '',
    color: '',
    pattern: '',
    weave: '',
    border: '',
    brand: 'Happy Sarees',
    collection: '',
    mrp: '',
    price: '',
    discountType: 'percentage',
    discountValue: '',
    stock: '',
    lowStockAlert: 3,
    trackInventory: true,
    allowBackOrders: false,
    sareeWidth: '1.1m',
    sareeLength: '5.5m',
    weight: '500g',
    blouseIncluded: true,
    blouseSize: '0.8m',
    washCare: 'Dry Clean Only',
    countryOfOrigin: 'India',
    showOnHomepage: true,
    newArrival: true,
    bestSeller: false,
    featuredCollection: false,
    saleProduct: false,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: '',
    videoData: '',
    seoTitle: '',
    metaDescription: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Load product if edit mode & pre-fill dynamic Master Data
  useEffect(() => {
    if (isEditMode) {
      const match = products.find(p => Number(p.id) === Number(id));
      if (match) {
        const gallery = Array.isArray(match.galleryImages) && match.galleryImages.length > 0
          ? match.galleryImages
          : (Array.isArray(match.images) && match.images.length > 0 ? match.images : (match.image ? [match.image] : []));

        setFormData(prev => ({
          ...prev,
          ...match,
          sareeLength: match.sareeLength || match.height || '5.5m',
          sareeWidth: match.sareeWidth || match.width || '1.1m',
          mrp: match.mrp || match.originalPrice || match.price || '',
          videoUrl: match.videoUrl || match.video_url || '',
          videoData: match.videoData || match.video_data || '',
          galleryImages: gallery,
          image: match.image || gallery[0] || prev.image || ''
        }));

        if (match.videoData || match.video_data) {
          setVideoMode('upload');
        } else if (match.videoUrl || match.video_url) {
          setVideoMode('url');
        }
      }
    } else {
      // Pre-fill first options of master data dynamically in create mode
      setFormData(prev => ({
        ...prev,
        galleryImages: prev.galleryImages || [],
        fabric: masterData.fabrics?.[0]?.name || prev.fabric || '',
        occasion: masterData.occasions?.[0]?.name || prev.occasion || '',
        color: masterData.colors?.[0]?.name || prev.color || '',
        pattern: masterData.patterns?.[0]?.name || prev.pattern || '',
        weave: masterData.weaves?.[0]?.name || prev.weave || '',
        border: masterData.borders?.[0]?.name || prev.border || '',
        brand: masterData.brands?.[0]?.name || prev.brand || 'Happy Sarees',
        collection: masterData.collections?.[0]?.name || prev.collection || ''
      }));
    }
  }, [id, isEditMode, products, masterData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: finalVal };

      // Auto Generate Slug from Name
      if (name === 'name') {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        updated.seoTitle = `${value} | Happy Sarees`;
      }

      // Auto update selling price based on discount type & mrp
      if (name === 'mrp' || name === 'discountValue' || name === 'discountType') {
        const mrpNum = Number(updated.mrp) || 0;
        const discVal = Number(updated.discountValue) || 0;
        if (updated.discountType === 'percentage') {
          updated.price = Math.round(mrpNum - (mrpNum * (discVal / 100)));
        } else if (updated.discountType === 'flat') {
          updated.price = Math.max(0, mrpNum - discVal);
        } else {
          updated.price = mrpNum;
        }
      }

      return updated;
    });
  };

  // Image Upload Handler (JPG, PNG, WEBP)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => {
          const isDefaultCover = (prev.image && prev.image.includes('unsplash.com')) || !prev.image || prev.image === '';
          const updatedGallery = [...(prev.galleryImages || []), base64String];
          return {
            ...prev,
            galleryImages: updatedGallery,
            image: isDefaultCover ? base64String : prev.image
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Video File Upload Handler (MP4, WEBM)
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const videoBase64 = reader.result;
      setFormData(prev => ({
        ...prev,
        videoData: videoBase64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteGalleryImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSetCoverImage = (imgUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imgUrl
    }));
  };

  const handleMoveImage = (fromIdx, toIdx) => {
    setFormData(prev => {
      const list = [...(prev.galleryImages || [])];
      if (toIdx < 0 || toIdx >= list.length) return prev;
      const temp = list[fromIdx];
      list[fromIdx] = list[toIdx];
      list[toIdx] = temp;
      return { ...prev, galleryImages: list };
    });
  };

  const handleSave = async (statusOverride) => {
    if (!formData.name) {
      alert("Product Name is required.");
      setActiveTab('basic');
      return;
    }
    if (!formData.sku) {
      alert("SKU is required.");
      setActiveTab('basic');
      return;
    }

    const finalStatus = statusOverride || formData.status;
    const finalData = { 
      ...formData, 
      status: finalStatus,
      stockCount: Number(formData.stock) || 0,
      inStock: (Number(formData.stock) || 0) > 0,
      height: formData.sareeLength,
      width: formData.sareeWidth,
      originalPrice: formData.mrp || formData.price,
      videoUrl: formData.videoUrl,
      videoData: formData.videoData
    };

    if (isEditMode) {
      await updateProduct(id, finalData);
      setToastMessage("Saree updated successfully!");
    } else {
      await addProduct(finalData);
      setToastMessage("Saree published successfully!");
    }

    setTimeout(() => {
      setToastMessage(null);
      navigate('/products');
    }, 1200);
  };

  // Simplified 7 Steps
  const tabs = [
    { id: 'basic', label: '1. Basic Information', icon: <FiFileText /> },
    { id: 'classification', label: '2. Classification', icon: <FiTag /> },
    { id: 'pricing', label: '3. Pricing & Inventory', icon: <FiDollarSign /> },
    { id: 'specifications', label: '4. Specifications', icon: <FiBookOpen /> },
    { id: 'media', label: '5. Images & Media', icon: <FiImage /> },
    { id: 'visibility', label: '6. Homepage Visibility', icon: <FiCompass /> },
    { id: 'seo', label: '7. SEO Settings', icon: <FiSettings /> }
  ];

  // Auto-calculated Stock Status
  const currentStockCount = Number(formData.stock) || 0;
  const computedStockStatus = currentStockCount > 0 ? 'In Stock' : 'Out of Stock';

  return (
    <div className={styles.wrapper}>
      {toastMessage && (
        <div className={styles.toast}>
          <FiCheck style={{ marginRight: '8px' }} />
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumb & Action bar */}
      <div className={styles.formHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/products')}>
            <FiArrowLeft /> Back
          </button>
          <div style={{ marginLeft: '12px' }}>
            <h2 className={styles.pageTitle}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            <nav style={{ fontSize: '12px', color: '#999999' }}>
              Dashboard &gt; Products &gt; {isEditMode ? 'Edit' : 'Add'}
            </nav>
          </div>
        </div>
        <div className={styles.headerRight}>
          {isEditMode && (
            <button 
              className={styles.previewBtn}
              onClick={() => navigate(`/products/preview/${id}`)}
            >
              Preview
            </button>
          )}
          <button className={styles.draftBtn} onClick={() => handleSave('Draft')}>
            Save Draft
          </button>
          <button className={styles.publishBtn} onClick={() => handleSave('Published')}>
            {isEditMode ? 'Update Product' : '+ Publish Product'}
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className={styles.splitLayout}>
        {/* Left Side: Vertical Tabs & Form Contents */}
        <div className={styles.leftColumn}>
          <div className={styles.tabLayout}>
            {/* Sidebar Tab buttons */}
            <div className={styles.tabMenu}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Forms Body Container */}
            <div className={styles.tabContentCard}>
              
              {/* Step 1: Basic Information */}
              {activeTab === 'basic' && (
                <div className={styles.tabPanel}>
                  <h3>Basic Information</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <label className={styles.required}>Product Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="Enter saree title..."
                      />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Slug (Auto-generated URL)</label>
                      <input 
                        type="text" 
                        name="slug" 
                        value={formData.slug} 
                        onChange={handleInputChange}
                        disabled
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label className={styles.required}>SKU</label>
                      <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku} 
                        onChange={handleInputChange}
                        placeholder="e.g. HS-001"
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Short Description</label>
                      <textarea 
                        name="shortDescription" 
                        value={formData.shortDescription} 
                        onChange={handleInputChange}
                        placeholder="Crisp summary for catalog listings..."
                        rows={3}
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Full Description</label>
                      <textarea 
                        name="longDescription" 
                        value={formData.longDescription} 
                        onChange={handleInputChange}
                        placeholder="Detailed information about weave, fabric craftsmanship, and drape..."
                        rows={6}
                      />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Product Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Classification (Dynamic from Master Data) */}
              {activeTab === 'classification' && (
                <div className={styles.tabPanel}>
                  <h3>Classification</h3>
                  <p style={{ fontSize: '12px', color: '#999999', marginBottom: '16px' }}>
                    All dropdown options are loaded dynamically from Master Data.
                  </p>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Fabric</label>
                      <select name="fabric" value={formData.fabric} onChange={handleInputChange}>
                        {masterData.fabrics?.map(f => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Occasion</label>
                      <select name="occasion" value={formData.occasion} onChange={handleInputChange}>
                        {masterData.occasions?.map(o => (
                          <option key={o.id} value={o.name}>{o.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Color</label>
                      <select name="color" value={formData.color} onChange={handleInputChange}>
                        {masterData.colors?.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Pattern</label>
                      <select name="pattern" value={formData.pattern} onChange={handleInputChange}>
                        {masterData.patterns?.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Weave Type</label>
                      <select name="weave" value={formData.weave} onChange={handleInputChange}>
                        {masterData.weaves?.map(w => (
                          <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Border Style</label>
                      <select name="border" value={formData.border} onChange={handleInputChange}>
                        {masterData.borders?.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Brand</label>
                      <select name="brand" value={formData.brand} onChange={handleInputChange}>
                        {masterData.brands?.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Collection (Optional)</label>
                      <select name="collection" value={formData.collection} onChange={handleInputChange}>
                        <option value="">None</option>
                        {masterData.collections?.map(col => (
                          <option key={col.id} value={col.name}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Inventory */}
              {activeTab === 'pricing' && (
                <div className={styles.tabPanel}>
                  <h3>Pricing</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Maximum Retail Price (MRP)</label>
                      <div className={styles.priceInputWrapper}>
                        <span>₹</span>
                        <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} placeholder="e.g. 5999" />
                      </div>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Discount Percentage (%)</label>
                      <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} placeholder="e.g. 15" />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Selling Price (Auto Calculated)</label>
                      <div className={styles.priceInputWrapper} style={{ backgroundColor: '#f9f9f9' }}>
                        <span>₹</span>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} disabled />
                      </div>
                    </div>
                  </div>

                  <h3 style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>Inventory</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Stock Quantity</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="e.g. 12" />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Low Stock Alert Limit</label>
                      <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Stock Status (Auto Calculated)</label>
                      <input 
                        type="text" 
                        value={computedStockStatus} 
                        disabled 
                        style={{ 
                          backgroundColor: '#f5f5f5', 
                          fontWeight: 'bold', 
                          color: currentStockCount > 0 ? '#2e7d32' : '#c62828' 
                        }} 
                      />
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <input type="checkbox" name="trackInventory" checked={formData.trackInventory} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Track Inventory</label>
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <input type="checkbox" name="allowBackOrders" checked={formData.allowBackOrders} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Allow Backorders</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Specifications */}
              {activeTab === 'specifications' && (
                <div className={styles.tabPanel}>
                  <h3>Specifications</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Saree Length</label>
                      <input type="text" name="sareeLength" value={formData.sareeLength} onChange={handleInputChange} placeholder="e.g. 5.5m" />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Saree Width</label>
                      <input type="text" name="sareeWidth" value={formData.sareeWidth} onChange={handleInputChange} placeholder="e.g. 1.1m" />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Blouse Length</label>
                      <input type="text" name="blouseSize" value={formData.blouseSize} onChange={handleInputChange} placeholder="e.g. 0.8m" />
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                      <input type="checkbox" name="blouseIncluded" checked={formData.blouseIncluded} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Blouse Included (Yes / No)</label>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Product Weight</label>
                      <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="e.g. 500g" />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Wash Care</label>
                      <input type="text" name="washCare" value={formData.washCare} onChange={handleInputChange} placeholder="e.g. Dry Clean Only" />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Country of Origin</label>
                      <input type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} placeholder="e.g. India" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Images & Media */}
              {activeTab === 'media' && (
                <div className={styles.tabPanel}>
                  <h3>Product Images & Gallery</h3>
                  <p style={{ fontSize: '12px', color: '#666666', marginBottom: '16px' }}>
                    Supported formats: <strong>JPG, PNG, WEBP</strong>. Set cover image and drag/order thumbnails below.
                  </p>

                  <div className={styles.formGrid}>
                    {/* Cover & Gallery Upload Controls */}
                    <div className={styles.formGroupHalf}>
                      <label>Upload Cover Image</label>
                      <button 
                        type="button" 
                        className={styles.uploadBtn}
                        onClick={() => document.getElementById('cover-image-upload-input').click()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#d11b69', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <FiUpload /> Choose Cover Image
                      </button>
                      <input 
                        id="cover-image-upload-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </div>

                    <div className={styles.formGroupHalf}>
                      <label>Upload Multiple Gallery Images</label>
                      <button 
                        type="button" 
                        className={styles.uploadBtnSecondary}
                        onClick={() => document.getElementById('gallery-images-upload-input').click()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        <FiPlus /> Add Gallery Images
                      </button>
                      <input 
                        id="gallery-images-upload-input"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <h4 style={{ margin: '14px 0 8px 0', fontSize: '14px' }}>Gallery Images</h4>
                      {(formData.galleryImages || []).length > 0 ? (
                        <div className={styles.uploadedGrid}>
                          {(formData.galleryImages || []).map((img, idx) => {
                            const isCover = formData.image === img;
                            return (
                              <div key={idx} className={`${styles.uploadedCard} ${isCover ? styles.uploadedCardCover : ''}`}>
                                <img src={img} alt={`Uploaded Saree ${idx}`} className={styles.uploadedImg} />
                                <div className={styles.uploadedActions}>
                                  <button 
                                    type="button" 
                                    className={styles.uploadedActionBtn}
                                    onClick={() => handleSetCoverImage(img)}
                                    style={{ color: isCover ? '#d11b69' : '#666666', fontWeight: isCover ? 'bold' : 'normal' }}
                                  >
                                    {isCover ? '✓ Cover' : 'Set Cover'}
                                  </button>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      type="button" 
                                      disabled={idx === 0}
                                      onClick={() => handleMoveImage(idx, idx - 1)}
                                      style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                                      title="Move Left"
                                    >
                                      <FiArrowUp style={{ transform: 'rotate(-90deg)' }} />
                                    </button>
                                    <button 
                                      type="button" 
                                      disabled={idx === (formData.galleryImages || []).length - 1}
                                      onClick={() => handleMoveImage(idx, idx + 1)}
                                      style={{ padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                                      title="Move Right"
                                    >
                                      <FiArrowDown style={{ transform: 'rotate(-90deg)' }} />
                                    </button>
                                  </div>
                                  <button 
                                    type="button" 
                                    className={styles.uploadedDeleteBtn}
                                    onClick={() => handleDeleteGalleryImage(idx)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: '#999999', fontStyle: 'italic' }}>No images uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Product Video Management */}
                  <h3 style={{ marginTop: '28px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                    <FiVideo style={{ marginRight: '8px', color: '#d11b69' }} /> Product Video
                  </h3>
                  <p style={{ fontSize: '12px', color: '#666666', marginBottom: '16px' }}>
                    Choose either an <strong>Uploaded Video File (MP4/WEBM)</strong> or a <strong>YouTube/Vimeo URL</strong>. If both are provided, the uploaded video file takes priority.
                  </p>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d11b69',
                        background: videoMode === 'upload' ? '#d11b69' : '#ffffff',
                        color: videoMode === 'upload' ? '#ffffff' : '#d11b69',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiUpload /> Option 1: Upload Video (MP4 / WEBM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode('url')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #2b2b2b',
                        background: videoMode === 'url' ? '#2b2b2b' : '#ffffff',
                        color: videoMode === 'url' ? '#ffffff' : '#2b2b2b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiLink /> Option 2: YouTube / Vimeo URL
                    </button>
                  </div>

                  <div className={styles.formGrid}>
                    {videoMode === 'upload' ? (
                      <div className={styles.formGroupFull}>
                        <label>Upload Video File (.mp4, .webm)</label>
                        <input 
                          type="file" 
                          accept="video/mp4,video/webm"
                          onChange={handleVideoUpload}
                          style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '6px', width: '100%' }}
                        />
                        {formData.videoData && (
                          <div style={{ marginTop: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>✓ Video File Attached</span>
                            <div style={{ marginTop: '6px' }}>
                              <video src={formData.videoData} controls style={{ maxWidth: '300px', borderRadius: '6px' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.formGroupFull}>
                        <label>Enter YouTube or Vimeo Video URL</label>
                        <input 
                          type="text" 
                          name="videoUrl" 
                          value={formData.videoUrl} 
                          onChange={handleInputChange} 
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://vimeo.com/123456" 
                        />
                        {formData.videoUrl && (
                          <p style={{ fontSize: '11px', color: '#666666', marginTop: '4px' }}>
                            Linked Video: <code>{formData.videoUrl}</code>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Step 6: Homepage Visibility */}
              {activeTab === 'visibility' && (
                <div className={styles.tabPanel}>
                  <h3>Homepage Visibility</h3>
                  <p style={{ fontSize: '13px', color: '#666666', marginBottom: '16px' }}>
                    Select which homepage collection sections this product should appear in.
                  </p>

                  <div style={{ background: '#fff8e1', border: '1px solid #ffe082', padding: '12px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '12px', color: '#5d4037' }}>
                    <strong>ℹ️ Automatic Section Placement:</strong>
                    <p style={{ margin: '4px 0 0 0' }}>
                      Products are automatically placed in <strong>Shop by Occasion</strong> and <strong>Shop by Fabric</strong> based on their Classification (e.g., Occasion "Wedding" → Shop by Occasion → Wedding; Fabric "Silk" → Shop by Fabric → Silk). No manual checkboxes needed.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="showOnHomepage" checked={formData.showOnHomepage} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Show on Homepage</strong>
                        <span>Display product across main homepage grids.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>New Arrival</strong>
                        <span>Appears in the New Arrivals collection.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Best Seller</strong>
                        <span>Appears in the Best Sellers collection.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="featuredCollection" checked={formData.featuredCollection} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Featured Collection</strong>
                        <span>Appears in Featured Collections curation.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="saleProduct" checked={formData.saleProduct} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Sale Product</strong>
                        <span>Appears in Special Deals & Sale collection.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 7: SEO */}
              {activeTab === 'seo' && (
                <div className={styles.tabPanel}>
                  <h3>SEO Settings</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <label>Meta Title</label>
                      <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} placeholder="e.g. Pure Kanchipuram Silk Saree | Happy Sarees" />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Meta Description</label>
                      <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows={3} placeholder="Describe product for search engine visibility..." />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Product Slug</label>
                      <input type="text" value={formData.slug} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Auto Preview URL</label>
                      <input 
                        type="text" 
                        value={`https://happysarees.com/product/${formData.slug || 'saree-slug'}`} 
                        disabled 
                        style={{ backgroundColor: '#f5f5f5', color: '#1565c0' }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigator Buttons */}
              <div className={styles.tabNavigatorRow}>
                <button
                  type="button"
                  disabled={activeTab === 'basic'}
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1].id);
                  }}
                  className={styles.tabNavBtn}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={activeTab === 'seo'}
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                  }}
                  className={styles.tabNavBtnActive}
                >
                  Next
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Quick Product Summary Sidebar */}
        <div className={styles.rightColumn}>
          <div className={styles.assistantCard}>
            <h3 className={styles.assistantTitle}>Quick Product Summary</h3>
            
            {/* Main Cover Image */}
            <div className={styles.mainCoverFrame}>
              <img src={formData.image} alt="Cover Preview" className={styles.coverPreviewImg} />
              <div className={styles.coverLabel}>Cover Image</div>
            </div>

            {/* Thumbnail Selector Grid */}
            <div className={styles.galleryThumbGrid}>
              {(formData.galleryImages || []).map((img, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbFrame} ${formData.image === img ? styles.thumbFrameActive : ''}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className={styles.thumbImg} onClick={() => handleSetCoverImage(img)} />
                  <button className={styles.thumbDeleteBtn} onClick={() => handleDeleteGalleryImage(idx)}>✕</button>
                  <div className={styles.thumbActionText} onClick={() => handleSetCoverImage(img)}>Set cover</div>
                </div>
              ))}
              <div 
                className={styles.addThumbBox} 
                onClick={() => document.getElementById('assistant-panel-file-input').click()}
              >
                <FiPlus style={{ fontSize: '20px', color: '#d11b69' }} />
                <span>Add Image</span>
                <input 
                  id="assistant-panel-file-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Clean Mini Details Summary */}
            <div className={styles.miniMetaSection}>
              <h4>Product Overview</h4>
              
              <div className={styles.miniMetaRow}>
                <div>
                  <strong>SKU:</strong>
                  <span>{formData.sku || '-'}</span>
                </div>
                <div>
                  <strong>Selling Price:</strong>
                  <span style={{ color: '#d11b69', fontWeight: 'bold' }}>₹{formData.price || '0'}</span>
                </div>
              </div>

              <div className={styles.miniMetaRow}>
                <div>
                  <strong>Current Stock:</strong>
                  <span>{formData.stock || '0'} ({computedStockStatus})</span>
                </div>
                <div>
                  <strong>Fabric:</strong>
                  <span>{formData.fabric || '-'}</span>
                </div>
              </div>

              <div className={styles.miniMetaRow}>
                <div>
                  <strong>Occasion:</strong>
                  <span>{formData.occasion || '-'}</span>
                </div>
                <div>
                  <strong>Status:</strong>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: formData.status === 'Published' ? '#2e7d32' : formData.status === 'Draft' ? '#ed6c02' : '#d32f2f' 
                  }}>
                    {formData.status}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <strong style={{ fontSize: '11px', color: '#666666' }}>Homepage Collections:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {formData.newArrival && <span style={{ fontSize: '10px', background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px' }}>New Arrival</span>}
                  {formData.bestSeller && <span style={{ fontSize: '10px', background: '#fff8e1', color: '#f57f17', padding: '2px 6px', borderRadius: '4px' }}>Best Seller</span>}
                  {formData.featuredCollection && <span style={{ fontSize: '10px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px' }}>Featured</span>}
                  {formData.saleProduct && <span style={{ fontSize: '10px', background: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px' }}>Sale</span>}
                  {!formData.newArrival && !formData.bestSeller && !formData.featuredCollection && !formData.saleProduct && (
                    <span style={{ fontSize: '11px', color: '#999999' }}>None</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductForm;
