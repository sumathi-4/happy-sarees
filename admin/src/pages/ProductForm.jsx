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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Form Field State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    longDescription: '',
    status: 'Published',
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
    stock: '10',
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
    let isMounted = true;
    if (isEditMode && id) {
      const loadProduct = async () => {
        let match = products.find(p => Number(p.id) === Number(id));
        if (!match) {
          try {
            const token = localStorage.getItem('hs_admin_token') || 'demo_token';
            const res = await fetch(`http://localhost:5001/api/admin/products/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const resData = await res.json();
            if (resData.success && resData.data?.product) {
              match = resData.data.product;
            }
          } catch (e) {
            console.log('[ProductForm] Direct fetch error:', e.message);
          }
        }

        if (match && isMounted) {
          const rawGallery = Array.isArray(match.galleryImages) && match.galleryImages.length > 0
            ? match.galleryImages
            : (Array.isArray(match.images) && match.images.length > 0 ? match.images : (match.image ? [match.image] : []));

          const gallery = rawGallery.map(img => typeof img === 'string' ? img : (img ? (img.url || img.image_data || img.image_url) : '')).filter(Boolean);
          const coverImage = match.image ? (typeof match.image === 'string' ? match.image : (match.image.url || match.image.image_data)) : (gallery[0] || '');

          const mrpNum = Number(match.mrp || match.originalPrice || match.price || 0);
          const priceNum = Number(match.price || 0);
          const calcDisc = mrpNum > priceNum && mrpNum > 0
            ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
            : '';

          const longDescVal = match.description || match.fullDescription || match.longDescription || match.full_description || '';

          const isNewArrivalVal = match.newArrival !== undefined ? Boolean(match.newArrival) : (match.isNewArrival !== undefined ? Boolean(match.isNewArrival) : (match.is_new_arrival !== undefined ? Boolean(match.is_new_arrival) : true));

          setFormData(prev => ({
            ...prev,
            ...match,
            newArrival: isNewArrivalVal,
            isNewArrival: isNewArrivalVal,
            is_new_arrival: isNewArrivalVal,
            shortDescription: match.shortDescription || match.short_description || '',
            fullDescription: longDescVal,
            description: longDescVal,
            longDescription: longDescVal,
            seoTitle: match.seoTitle || match.meta_title || `${match.name} | Happy Sarees`,
            metaDescription: match.metaDescription || match.meta_description || match.shortDescription || longDescVal || '',
            washCare: match.washCare || match.wash_care || 'Dry Clean Only',
            sareeLength: match.sareeLength || match.height || '5.5m',
            sareeWidth: match.sareeWidth || match.width || '1.1m',
            mrp: mrpNum || '',
            price: priceNum || '',
            discountType: 'percentage',
            discountValue: match.discountValue !== undefined && match.discountValue !== '' ? match.discountValue : calcDisc,
            videoUrl: match.videoUrl || match.video_url || '',
            videoData: match.videoData || match.video_data || '',
            galleryImages: gallery,
            image: coverImage
          }));

          const vurl = match.videoUrl || match.video_url || '';
          const vdata = match.videoData || match.video_data || '';
          if (vdata) {
            setVideoMode('upload');
          } else if (vurl) {
            if (vurl.includes('youtube') || vurl.includes('youtu.be') || vurl.includes('vimeo')) {
              setVideoMode('url');
            } else {
              setVideoMode('upload');
            }
          }
        }
      };

      loadProduct();
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

    return () => { isMounted = false; };
  }, [id, isEditMode, products]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;

    setFormData(prev => {
      const updated = { ...prev, [name]: finalVal };

      if (name === 'newArrival' || name === 'isNewArrival' || name === 'is_new_arrival') {
        updated.newArrival = Boolean(finalVal);
        updated.isNewArrival = Boolean(finalVal);
        updated.is_new_arrival = Boolean(finalVal);
      }

      if (name === 'longDescription' || name === 'fullDescription' || name === 'description') {
        updated.description = value;
        updated.fullDescription = value;
        updated.longDescription = value;
      }
      if (name === 'shortDescription' || name === 'short_description') {
        updated.shortDescription = value;
        updated.short_description = value;
      }

      // Auto Generate Slug, SKU, and SEO from Name
      if (name === 'name') {
        const slugVal = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        updated.slug = slugVal;

        // Auto Generate SEO Title & Meta Description if empty or not customized
        if (!prev.seoTitle || prev.seoTitle.includes('| Happy Sarees') || isNaN(id)) {
          updated.seoTitle = `${value} | Happy Sarees`;
        }
        if (!prev.metaDescription || isNaN(id)) {
          updated.metaDescription = `Buy authentic ${value} online at Happy Sarees. Crafted in premium ${updated.fabric || 'silk'} for weddings and festive occasions. ${updated.shortDescription || ''}`;
        }

        // Auto Generate SKU if empty or not set
        if (!prev.sku || prev.sku.startsWith('HS-') || isNaN(id)) {
          const code = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'SAREE';
          const num = Math.floor(1000 + Math.random() * 9000);
          updated.sku = `HS-${code}-${num}`;
        }
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

  // Helper: In-browser Canvas Image Compressor (Reduces 10MB uploads to lightweight ~50KB)
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressed);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Image Upload Handler (JPG, PNG, WEBP)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      const base64String = await compressImageFile(file);
      if (!base64String) continue;
      setFormData(prev => {
        const updatedGallery = [...(prev.galleryImages || []), base64String];
        return {
          ...prev,
          galleryImages: updatedGallery,
          image: base64String
        };
      });
    }
  };

  // Video File Upload Handler (MP4, WEBM, MOV) with FormData and Progress tracking
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Allowed formats: MP4, WEBM, MOV
    const allowedExtensions = ['mp4', 'webm', 'mov'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadError('Unsupported format. Allowed formats: MP4, WEBM, MOV');
      setFormData(prev => ({ ...prev, videoUrl: '', videoData: '' }));
      e.target.value = '';
      return;
    }

    // Maximum Size: 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 50MB.');
      setFormData(prev => ({ ...prev, videoUrl: '', videoData: '' }));
      e.target.value = '';
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('hs_admin_token') || 'demo_token';
    
    // Determine API host dynamically
    const isLocal = window.location.hostname === 'localhost';
    const uploadUrl = isLocal 
      ? 'http://localhost:5001/api/admin/upload/video'
      : `${window.location.origin}/api/admin/upload/video`;

    xhr.open('POST', uploadUrl, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.url) {
            setFormData(prev => ({
              ...prev,
              videoUrl: response.url,
              video_url: response.url,
              videoData: '',
              video_data: ''
            }));
            setToastMessage("Video uploaded successfully to Cloudinary!");
            setTimeout(() => setToastMessage(null), 3000);
          } else {
            setUploadError(response.message || 'Upload failed.');
          }
        } catch (err) {
          setUploadError('Failed to parse server response.');
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          setUploadError(response.message || `Upload failed with status ${xhr.status}`);
        } catch (e) {
          setUploadError(`Upload failed with status ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error occurred during upload.');
    };

    const uploadData = new FormData();
    uploadData.append('video', file);
    xhr.send(uploadData);
  };

  const handleRemoveVideo = async () => {
    const videoUrlToRemove = formData.videoUrl || formData.video_url;
    if (!videoUrlToRemove) return;

    try {
      setToastMessage("Deleting video from Cloudinary...");
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      
      const isLocal = window.location.hostname === 'localhost';
      const deleteUrl = isLocal 
        ? 'http://localhost:5001/api/admin/upload/delete-video'
        : `${window.location.origin}/api/admin/upload/delete-video`;

      const res = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ videoUrl: videoUrlToRemove })
      });

      const data = await res.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          videoUrl: '',
          video_url: '',
          videoData: '',
          video_data: ''
        }));
        setUploadProgress(0);
        setToastMessage("Video removed successfully from Cloudinary.");
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        setUploadError(data.message || 'Failed to delete video.');
        setToastMessage(null);
      }
    } catch (err) {
      console.log('[ProductForm] Error removing video:', err.message);
      setUploadError(`Failed to delete video: ${err.message}`);
      setToastMessage(null);
    }
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

    const descVal = formData.description || formData.fullDescription || formData.longDescription || '';
    const finalStatus = statusOverride || formData.status;
    const isNewArrivalVal = formData.newArrival !== undefined ? Boolean(formData.newArrival) : (formData.isNewArrival !== undefined ? Boolean(formData.isNewArrival) : Boolean(formData.is_new_arrival));

    const finalData = { 
      ...formData, 
      newArrival: isNewArrivalVal,
      isNewArrival: isNewArrivalVal,
      is_new_arrival: isNewArrivalVal,
      description: descVal,
      fullDescription: descVal,
      longDescription: descVal,
      shortDescription: formData.shortDescription || '',
      washCare: formData.washCare || 'Dry Clean Only',
      status: finalStatus,
      stockCount: Number(formData.stock) || 0,
      inStock: (Number(formData.stock) || 0) > 0,
      height: formData.sareeLength,
      width: formData.sareeWidth,
      originalPrice: formData.mrp || formData.price,
      image: formData.image,
      galleryImages: formData.galleryImages,
      images: formData.galleryImages,
      videoUrl: formData.videoUrl || ''
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
            <nav style={{ fontSize: '12px', color: 'var(--text-light)' }}>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className={styles.required} style={{ marginBottom: 0 }}>SKU (Auto-generated)</label>
                        <button 
                          type="button" 
                          onClick={() => {
                            const nameCode = (formData.name || 'SAREE').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'SAREE';
                            const num = Math.floor(1000 + Math.random() * 9000);
                            setFormData(prev => ({ ...prev, sku: `HS-${nameCode}-${num}` }));
                          }}
                          style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          ⚡ Auto Generate SKU
                        </button>
                      </div>
                      <input 
                        type="text" 
                        name="sku" 
                        value={formData.sku} 
                        onChange={handleInputChange}
                        placeholder="Auto-generated e.g. HS-KUTI-1001"
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
                        value={formData.longDescription || formData.description || formData.fullDescription || ''} 
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
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px' }}>
                    All dropdown options are loaded dynamically from Master Data.
                  </p>
                  <div className={styles.formGrid}>
                    {Object.keys(masterData || {}).map((typeKey) => {
                      const typeLabel = typeKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      const items = masterData[typeKey] || [];
                      // Map standard singular names for backend compatibility
                      const fieldNameMap = {
                        fabrics: 'fabric',
                        occasions: 'occasion',
                        colors: 'color',
                        patterns: 'pattern',
                        weaves: 'weave',
                        borders: 'border',
                        brands: 'brand',
                        collections: 'collection'
                      };
                      const nameAttr = fieldNameMap[typeKey] || typeKey;
                      const selectedVal = formData[nameAttr] || formData[typeKey] || formData.customMasterData?.[typeKey] || '';

                      return (
                        <div className={styles.formGroupHalf} key={typeKey}>
                          <label>{typeLabel}</label>
                          <select 
                            name={nameAttr} 
                            value={selectedVal} 
                            onChange={(e) => {
                              const val = e.target.value;
                              handleInputChange(e);
                              setFormData(prev => ({
                                ...prev,
                                [typeKey]: val,
                                [nameAttr]: val,
                                customMasterData: {
                                  ...(prev.customMasterData || {}),
                                  [typeKey]: val,
                                  [nameAttr]: val
                                }
                              }));
                            }}
                          >
                            <option value="">Select {typeLabel}</option>
                            {items.map(item => (
                              <option key={item.id || item.name} value={item.name}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
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

                  <h3 style={{ marginTop: '24px', borderTop: '1px solid rgba(43, 18, 32, 0.06)', paddingTop: '20px' }}>Inventory</h3>
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
                          color: currentStockCount > 0 ? 'var(--success-color)' : 'var(--error-color)' 
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
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--primary-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--text-color)', color: 'var(--bg-white)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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
                                    style={{ color: isCover ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: isCover ? 'bold' : 'normal' }}
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
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No images uploaded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Product Video Management */}
                  <h3 style={{ marginTop: '28px', borderTop: '1px solid rgba(43, 18, 32, 0.06)', paddingTop: '20px' }}>
                    <FiVideo style={{ marginRight: '8px', color: 'var(--primary-color)' }} /> Product Video
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Choose either an <strong>Uploaded Video File (MP4/WEBM)</strong> or a <strong>YouTube/Vimeo URL</strong>. If both are provided, the uploaded video file takes priority.
                  </p>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--primary-color)',
                        background: videoMode === 'upload' ? 'var(--primary-color)' : 'var(--bg-white)',
                        color: videoMode === 'upload' ? 'var(--bg-white)' : 'var(--primary-color)',
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
                        border: '1px solid var(--text-color)',
                        background: videoMode === 'url' ? 'var(--text-color)' : 'var(--bg-white)',
                        color: videoMode === 'url' ? 'var(--bg-white)' : 'var(--text-color)',
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
                        <label>Upload Video File (.mp4, .webm, .mov)</label>
                        <input 
                          type="file" 
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={handleVideoUpload}
                          disabled={isUploading}
                          style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '6px', width: '100%', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                        />

                        {isUploading && (
                          <div style={{ marginTop: '12px', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600 }}>Uploading to Cloudinary...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-soft-pink-darker)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.1s ease' }}></div>
                            </div>
                          </div>
                        )}
                        {uploadError && (
                          <div style={{ color: 'var(--error-color)', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}>
                            ⚠ {uploadError}
                          </div>
                        )}
                        {Boolean(formData.videoUrl || formData.video_url || formData.videoData || formData.video_data) && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: 600 }}>✓ Video File Attached</span>
                              <button 
                                type="button" 
                                onClick={handleRemoveVideo}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--error-color)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0
                                }}
                              >
                                Remove Video
                              </button>
                            </div>
                            <div style={{ marginTop: '8px' }}>
                              <video 
                                src={formData.videoUrl || formData.video_url || formData.videoData || formData.video_data} 
                                controls 
                                style={{ maxWidth: '360px', borderRadius: '6px', backgroundColor: '#000000' }} 
                              />
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
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
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
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
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
                      <input type="checkbox" name="newArrival" checked={formData.newArrival} onChange={handleInputChange} className={styles.checkbox} />
                      <div className={styles.toggleText}>
                        <strong>New Arrival</strong>
                        <span>Appears in the New Arrivals collection.</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 7: SEO */}
              {activeTab === 'seo' && (
                <div className={styles.tabPanel}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>SEO Settings</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const nameStr = formData.name || 'Saree';
                        const fabricStr = formData.fabric || 'Silk';
                        const descStr = formData.shortDescription || formData.description || '';
                        setFormData(prev => ({
                          ...prev,
                          seoTitle: `${nameStr} - Premium ${fabricStr} | Happy Sarees`,
                          metaDescription: `Buy authentic ${nameStr} online at Happy Sarees. Crafted in pure ${fabricStr} for weddings and festive occasions. ${descStr}`
                        }));
                      }}
                      style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⚡ Auto Generate Full SEO
                    </button>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroupFull}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ marginBottom: 0 }}>Meta Title (Auto-generated & Editable)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nameStr = formData.name || 'Saree';
                            const fabricStr = formData.fabric || 'Silk';
                            setFormData(prev => ({ ...prev, seoTitle: `${nameStr} - Premium ${fabricStr} | Happy Sarees` }));
                          }}
                          style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          ⚡ Auto Generate Title
                        </button>
                      </div>
                      <input 
                        type="text" 
                        name="seoTitle" 
                        value={formData.seoTitle} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Pure Kanchipuram Silk Saree | Happy Sarees" 
                      />
                    </div>

                    <div className={styles.formGroupFull}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ marginBottom: 0 }}>Meta Description (Auto-generated & Editable)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nameStr = formData.name || 'Saree';
                            const fabricStr = formData.fabric || 'Silk';
                            const descStr = formData.shortDescription || formData.description || '';
                            setFormData(prev => ({ 
                              ...prev, 
                              metaDescription: `Buy authentic ${nameStr} online at Happy Sarees. Crafted in pure ${fabricStr} for weddings and festive occasions. ${descStr}` 
                            }));
                          }}
                          style={{ border: 'none', background: 'none', color: 'var(--primary-color)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          ⚡ Auto Generate Description
                        </button>
                      </div>
                      <textarea 
                        name="metaDescription" 
                        value={formData.metaDescription} 
                        onChange={handleInputChange} 
                        rows={3} 
                        placeholder="Describe product for search engine visibility..." 
                      />
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
                        style={{ backgroundColor: '#f5f5f5', color: 'var(--info-color)' }} 
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
              {formData.image ? (
                <img src={formData.image} alt="Cover Preview" className={styles.coverPreviewImg} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '13px' }}>
                  <span>No Cover Image</span>
                </div>
              )}
              <div className={styles.coverLabel}>Cover Image</div>
            </div>

            {/* Thumbnail Selector Grid */}
            <div className={styles.galleryThumbGrid}>
              {(formData.galleryImages || []).map((img, idx) => (
                img ? (
                  <div 
                    key={idx} 
                    className={`${styles.thumbFrame} ${formData.image === img ? styles.thumbFrameActive : ''}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className={styles.thumbImg} onClick={() => handleSetCoverImage(img)} />
                    <button className={styles.thumbDeleteBtn} onClick={() => handleDeleteGalleryImage(idx)}>✕</button>
                    <div className={styles.thumbActionText} onClick={() => handleSetCoverImage(img)}>Set cover</div>
                  </div>
                ) : null
              ))}
              <div 
                className={styles.addThumbBox} 
                onClick={() => document.getElementById('assistant-panel-file-input').click()}
              >
                <FiPlus style={{ fontSize: '20px', color: 'var(--primary-color)' }} />
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
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>₹{formData.price || '0'}</span>
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
                    color: formData.status === 'Published' ? 'var(--success-color)' : formData.status === 'Draft' ? '#ed6c02' : 'var(--error-color)' 
                  }}>
                    {formData.status}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <strong style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Homepage Collections:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {formData.newArrival && <span style={{ fontSize: '10px', background: 'var(--info-bg)', color: 'var(--info-color)', padding: '2px 6px', borderRadius: '4px' }}>New Arrival</span>}
                  {formData.bestSeller && <span style={{ fontSize: '10px', background: '#fff8e1', color: '#f57f17', padding: '2px 6px', borderRadius: '4px' }}>Best Seller</span>}
                  {formData.featuredCollection && <span style={{ fontSize: '10px', background: 'var(--success-bg)', color: 'var(--success-color)', padding: '2px 6px', borderRadius: '4px' }}>Featured</span>}
                  {formData.saleProduct && <span style={{ fontSize: '10px', background: 'var(--error-bg)', color: 'var(--error-color)', padding: '2px 6px', borderRadius: '4px' }}>Sale</span>}
                  {!formData.newArrival && !formData.bestSeller && !formData.featuredCollection && !formData.saleProduct && (
                    <span style={{ fontSize: '10px', color: '#888' }}>Standard Listing</span>
                  )}
                </div>
              </div>

              {formData.shortDescription && (
                <div style={{ marginTop: '10px', background: '#fdf8fa', padding: '8px', borderRadius: '6px', border: '1px solid #f8e1ec' }}>
                  <strong style={{ fontSize: '11px', color: 'var(--primary-color)' }}>Short Description:</strong>
                  <p style={{ fontSize: '12px', color: '#444444', marginTop: '2px', marginBottom: 0 }}>{formData.shortDescription}</p>
                </div>
              )}
              {(formData.fullDescription || formData.description) && (
                <div style={{ marginTop: '8px', background: '#f9f9f9', padding: '8px', borderRadius: '6px', border: '1px solid #eeeeee' }}>
                  <strong style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Description:</strong>
                  <p style={{ fontSize: '12px', color: '#444444', marginTop: '2px', marginBottom: 0, lineHeight: '1.4' }}>
                    {(formData.fullDescription || formData.description).slice(0, 150)}
                    {(formData.fullDescription || formData.description).length > 150 ? '...' : ''}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductForm;
