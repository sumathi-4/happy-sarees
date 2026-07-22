import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiArrowLeft, FiSave, FiCheck, FiImage, FiTrash2, 
  FiFileText, FiTag, FiDollarSign, FiBox, FiBookOpen, 
  FiSearch, FiCompass, FiTruck, FiSettings, FiPlus,
  FiMoreHorizontal
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/ProductForm.module.css';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { products, addProduct, updateProduct, masterData } = useAdminData();

  // Active Tab state
  const [activeTab, setActiveTab] = useState('basic');

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
    gst: 5,
    costPrice: '',
    stock: '',
    lowStockAlert: 3,
    stockStatus: 'In Stock',
    trackInventory: true,
    allowBackOrders: false,
    barcode: '',
    width: '1.1m',
    height: '5.5m',
    weight: '500g',
    blouseIncluded: true,
    blouseSize: '0.8m',
    washCare: 'Dry Clean Only',
    countryOfOrigin: 'India',
    manufacturer: 'Happy Sarees Handloom Co.',
    hsnCode: '5007',
    showOnHomepage: true,
    newArrival: true,
    bestSeller: false,
    featuredCollection: false,
    saleProduct: false,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', // default fallback
    galleryImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: '',
    seoTitle: '',
    metaDescription: '',
    keywords: '',
    seoUrl: '',
    canonicalUrl: '',
    openGraphImage: '',
    packageLength: '30cm',
    packageWidth: '22cm',
    packageHeight: '8cm',
    shippingClass: 'Standard',
    freeShipping: false,
    careInstructions: 'Dry clean only.',
    returnPolicy: 'Easy 7-day returns.',
    exchangePolicy: 'Exchanges eligible within 15 days.',
    internalNotes: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Load product if edit mode
  useEffect(() => {
    if (isEditMode) {
      const match = products.find(p => p.id === Number(id));
      if (match) {
        setFormData({ ...match });
      } else {
        alert('Product not found.');
        navigate('/products');
      }
    } else {
      // Pre-fill first options of master data in create mode
      setFormData(prev => ({
        ...prev,
        fabric: masterData.fabrics?.[0]?.name || '',
        occasion: masterData.occasions?.[0]?.name || '',
        color: masterData.colors?.[0]?.name || '',
        pattern: masterData.patterns?.[0]?.name || '',
        weave: masterData.weaves?.[0]?.name || '',
        border: masterData.borders?.[0]?.name || '',
        brand: masterData.brands?.[0]?.name || 'Happy Sarees',
        collection: masterData.collections?.[0]?.name || ''
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
        updated.seoUrl = updated.slug;
        updated.seoTitle = `${value} | Happy Sarees Admin`;
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

      // Auto update stock status
      if (name === 'stock') {
        const stk = Number(value) || 0;
        if (stk > 5) updated.stockStatus = 'In Stock';
        else if (stk > 0) updated.stockStatus = 'Low Stock';
        else updated.stockStatus = 'Out of Stock';
      }

      return updated;
    });
  };

  // Profit Margin calculation helper
  const calculateProfitMargin = () => {
    const sellPrice = Number(formData.price) || 0;
    const costPrice = Number(formData.costPrice) || 0;
    if (sellPrice <= 0) return '0%';
    const profit = sellPrice - costPrice;
    const marginPercent = (profit / sellPrice) * 100;
    return `${marginPercent.toFixed(1)}%`;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => {
          const isDefaultCover = prev.image.includes('unsplash.com') || !prev.image || prev.image === '';
          const updatedGallery = [...prev.galleryImages, base64String];
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

  const handleDeleteGalleryImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== idx)
    }));
  };

  const handleSetCoverImage = (imgUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imgUrl
    }));
  };

  const handleSave = (statusOverride) => {
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
    const finalData = { ...formData, status: finalStatus };

    if (isEditMode) {
      updateProduct(id, finalData);
      setToastMessage("Saree updated successfully!");
    } else {
      addProduct(finalData);
      setToastMessage("Saree published successfully!");
    }

    setTimeout(() => {
      setToastMessage(null);
      navigate('/products');
    }, 1500);
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Information', icon: <FiFileText /> },
    { id: 'classification', label: '2. Classification', icon: <FiTag /> },
    { id: 'pricing', label: '3. Pricing & Inventory', icon: <FiDollarSign /> },
    { id: 'specifications', label: '4. Specifications', icon: <FiBookOpen /> },
    { id: 'media', label: '5. Images & Media', icon: <FiImage /> },
    { id: 'visibility', label: '6. Homepage Visibility', icon: <FiCompass /> },
    { id: 'seo', label: '7. SEO Settings', icon: <FiSettings /> },
    { id: 'shipping', label: '8. Shipping', icon: <FiTruck /> },
    { id: 'additional', label: '9. Additional Info', icon: <FiMoreHorizontal /> }
  ];

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
              
              {/* Tab 1: Basic Information */}
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
                        placeholder="Enter premium saree title..."
                      />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Slug (Auto generated URL)</label>
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
                        placeholder="e.g. HS005"
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Short Description</label>
                      <textarea 
                        name="shortDescription" 
                        value={formData.shortDescription} 
                        onChange={handleInputChange}
                        placeholder="Enter crisp teaser details..."
                        rows={3}
                      />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Long Description</label>
                      <textarea 
                        name="longDescription" 
                        value={formData.longDescription} 
                        onChange={handleInputChange}
                        placeholder="Enter full heritage details, weaves, and wash care instruction stories..."
                        rows={6}
                      />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Classification */}
              {activeTab === 'classification' && (
                <div className={styles.tabPanel}>
                  <h3>Classification</h3>
                  <p style={{ fontSize: '12px', color: '#999999', marginBottom: '16px' }}>
                    All classifications are powered dynamically by the Master Data module.
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
                      <label>Border style</label>
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

              {/* Tab 3: Pricing & Inventory */}
              {activeTab === 'pricing' && (
                <div className={styles.tabPanel}>
                  <h3>Pricing & Financials</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Maximum Retail Price (MRP)</label>
                      <div className={styles.priceInputWrapper}>
                        <span>₹</span>
                        <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Discount Type</label>
                      <select name="discountType" value={formData.discountType} onChange={handleInputChange}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                        <option value="none">No Discount</option>
                      </select>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Discount Value</label>
                      <input type="number" name="discountValue" value={formData.discountValue} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Selling Price (Auto-computed)</label>
                      <div className={styles.priceInputWrapper} style={{ backgroundColor: '#f9f9f9' }}>
                        <span>₹</span>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} disabled />
                      </div>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>GST Rate (%)</label>
                      <input type="number" name="gst" value={formData.gst} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Cost Price (Landing Cost)</label>
                      <div className={styles.priceInputWrapper}>
                        <span>₹</span>
                        <input type="number" name="costPrice" value={formData.costPrice} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Estimated Net Profit Margin</label>
                      <div className={styles.marginDisplayBox}>
                        {calculateProfitMargin()}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>Inventory Control</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Stock Quantity</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Low Stock Warning Limit</label>
                      <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Barcode / EAN</label>
                      <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Stock Status</label>
                      <input type="text" value={formData.stockStatus} disabled style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                      <input type="checkbox" name="trackInventory" checked={formData.trackInventory} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Track Inventory Levels</label>
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                      <input type="checkbox" name="allowBackOrders" checked={formData.allowBackOrders} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Allow Customer Backorders</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Specifications */}
              {activeTab === 'specifications' && (
                <div className={styles.tabPanel}>
                  <h3>Physical Specifications</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Width (e.g. 1.1m)</label>
                      <input type="text" name="width" value={formData.width} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Height (e.g. 5.5m)</label>
                      <input type="text" name="height" value={formData.height} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Weight (e.g. 600g)</label>
                      <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Blouse Size (e.g. 0.8m)</label>
                      <input type="text" name="blouseSize" value={formData.blouseSize} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                      <input type="checkbox" name="blouseIncluded" checked={formData.blouseIncluded} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Blouse Fabric Included</label>
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>HSN Code</label>
                      <input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Wash Care Instructions</label>
                      <input type="text" name="washCare" value={formData.washCare} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Country of Origin</label>
                      <input type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Manufacturer Details</label>
                      <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Images & Media */}
              {activeTab === 'media' && (
                <div className={styles.tabPanel}>
                  <h3>Media Assets</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <label>Video Highlight URL (YouTube/Vimeo/MP4)</label>
                      <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." />
                    </div>

                    <div className={styles.formGroupFull}>
                      <label>Upload Saree Images</label>
                      <div 
                        className={styles.uploadDropZone}
                        onClick={() => document.getElementById('media-tab-file-input').click()}
                      >
                        <FiImage className={styles.uploadZoneIcon} />
                        <span className={styles.uploadZoneText}>Click to upload or drag and drop</span>
                        <span className={styles.uploadZoneSubtext}>PNG, JPG, WEBP up to 5MB</span>
                        <button type="button" className={styles.uploadZoneBtn}>Upload Images</button>
                        <input 
                          id="media-tab-file-input"
                          type="file"
                          multiple
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroupFull}>
                      <h4 style={{ margin: '14px 0 8px 0', fontSize: '14px' }}>Uploaded Gallery Images</h4>
                      {formData.galleryImages.length > 0 ? (
                        <div className={styles.uploadedGrid}>
                          {formData.galleryImages.map((img, idx) => {
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
                                  <button 
                                    type="button" 
                                    className={styles.uploadedDeleteBtn}
                                    onClick={() => handleDeleteGalleryImage(idx)}
                                  >
                                    <FiTrash2 />
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
                </div>
              )}

              {/* Tab 6: Homepage Visibility */}
              {activeTab === 'visibility' && (
                <div className={styles.tabPanel}>
                  <h3>Homepage Visibility & Tags</h3>
                  <p style={{ fontSize: '13px', color: '#666666', marginBottom: '20px' }}>
                    Configure where this saree matches Homepage curation criteria and promo banners.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="showOnHomepage" checked={formData.showOnHomepage} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Show on Homepage</strong>
                        <span>Include in lists shown on home viewport.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>New Arrival</strong>
                        <span>Renders a New Arrival badge.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="bestSeller" checked={formData.bestSeller} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Bestseller</strong>
                        <span>Renders a Bestseller badge.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="featuredCollection" checked={formData.featuredCollection} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Featured Collection</strong>
                        <span>Show inside Signature curation sections.</span>
                      </div>
                    </label>
                    <label className={styles.toggleLabel}>
                      <input type="checkbox" name="saleProduct" checked={formData.saleProduct} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>Sale Product</strong>
                        <span>Renders a Sale badge.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 7: SEO Settings */}
              {activeTab === 'seo' && (
                <div className={styles.tabPanel}>
                  <h3>Search Engine Optimization (SEO)</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <label>SEO Meta Title</label>
                      <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Meta Description</label>
                      <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows={3} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Keywords (comma separated)</label>
                      <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="saree, silk, kanchipuram" />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Canonical URL</label>
                      <input type="text" name="canonicalUrl" value={formData.canonicalUrl} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Open Graph Image URL</label>
                      <input type="text" name="openGraphImage" value={formData.openGraphImage} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 8: Shipping */}
              {activeTab === 'shipping' && (
                <div className={styles.tabPanel}>
                  <h3>Logistics & Shipping Details</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupHalf}>
                      <label>Weight (including box)</label>
                      <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Package Length</label>
                      <input type="text" name="packageLength" value={formData.packageLength} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Package Width</label>
                      <input type="text" name="packageWidth" value={formData.packageWidth} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Package Height</label>
                      <input type="text" name="packageHeight" value={formData.packageHeight} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroupHalf}>
                      <label>Shipping Class</label>
                      <select name="shippingClass" value={formData.shippingClass} onChange={handleInputChange}>
                        <option value="Standard">Standard Logistics</option>
                        <option value="Express">Express Cargo</option>
                      </select>
                    </div>
                    <div className={styles.formGroupHalf} style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                      <input type="checkbox" name="freeShipping" checked={formData.freeShipping} onChange={handleInputChange} className={styles.checkbox} />
                      <label style={{ margin: 0 }}>Eligible for Free Shipping</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 9: Additional Information */}
              {activeTab === 'additional' && (
                <div className={styles.tabPanel}>
                  <h3>Additional Documentation</h3>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <label>Care Instructions</label>
                      <textarea name="careInstructions" value={formData.careInstructions} onChange={handleInputChange} rows={2} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Return Policy Details</label>
                      <textarea name="returnPolicy" value={formData.returnPolicy} onChange={handleInputChange} rows={2} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Exchange Policy Details</label>
                      <textarea name="exchangePolicy" value={formData.exchangePolicy} onChange={handleInputChange} rows={2} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label>Internal notes (Staff view only)</label>
                      <textarea name="internalNotes" value={formData.internalNotes} onChange={handleInputChange} rows={3} placeholder="Notes about looms, weavers, material batches..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons at the bottom of the card */}
              <div className={styles.tabNavigatorRow}>
                <button
                  type="button"
                  disabled={activeTab === 'basic'}
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    setActiveTab(tabs[idx - 1].id);
                  }}
                  className={styles.tabNavBtn}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={activeTab === 'additional'}
                  onClick={() => {
                    const idx = tabs.findIndex(t => t.id === activeTab);
                    setActiveTab(tabs[idx + 1].id);
                  }}
                  className={styles.tabNavBtnActive}
                >
                  Next
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Persistent Media Assistant sidebar */}
        <div className={styles.rightColumn}>
          <div className={styles.assistantCard}>
            <h3 className={styles.assistantTitle}>Product Images</h3>
            <p style={{ fontSize: '11px', color: '#999999', marginBottom: '14px' }}>
              Drag, order, and toggle images. Highlighting an item marks it as the main cover photo.
            </p>
            
            {/* Main cover image frame */}
            <div className={styles.mainCoverFrame}>
              <img src={formData.image} alt="Cover Preview" className={styles.coverPreviewImg} />
              <div className={styles.coverLabel}>Cover Image</div>
            </div>

            {/* Thumbnail selector grids */}
            <div className={styles.galleryThumbGrid}>
              {formData.galleryImages.map((img, idx) => (
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
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Mini metadata summary details */}
            <div className={styles.miniMetaSection}>
              <h4>Quick Details Summary</h4>
              <div className={styles.miniMetaRow}>
                <div>
                  <strong>SKU:</strong>
                  <span>{formData.sku || '-'}</span>
                </div>
                <div>
                  <strong>Barcode:</strong>
                  <span>{formData.barcode || '-'}</span>
                </div>
              </div>
              <div className={styles.miniMetaRow}>
                <div>
                  <strong>Fabric:</strong>
                  <span>{formData.fabric || '-'}</span>
                </div>
                <div>
                  <strong>Occasion:</strong>
                  <span>{formData.occasion || '-'}</span>
                </div>
              </div>
              <div className={styles.miniMetaRow}>
                <div>
                  <strong>Selling Price:</strong>
                  <span>₹{formData.price || '0'}</span>
                </div>
                <div>
                  <strong>Inventory Stock:</strong>
                  <span>{formData.stock || '0'}</span>
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
