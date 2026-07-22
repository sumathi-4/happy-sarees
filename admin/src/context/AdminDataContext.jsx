import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminDataContext = createContext();

const INITIAL_MASTER_DATA = {
  fabrics: [
    { id: 'f1', name: 'Silk', status: 'Active', sortOrder: 1 },
    { id: 'f2', name: 'Cotton', status: 'Active', sortOrder: 2 },
    { id: 'f3', name: 'Linen', status: 'Active', sortOrder: 3 },
    { id: 'f4', name: 'Organza', status: 'Active', sortOrder: 4 },
    { id: 'f5', name: 'Georgette', status: 'Active', sortOrder: 5 },
    { id: 'f6', name: 'Tissue', status: 'Active', sortOrder: 6 },
    { id: 'f7', name: 'Banarasi Silk', status: 'Active', sortOrder: 7 },
    { id: 'f8', name: 'Kanchipuram Silk', status: 'Active', sortOrder: 8 }
  ],
  occasions: [
    { id: 'o1', name: 'Wedding', status: 'Active', sortOrder: 1 },
    { id: 'o2', name: 'Reception', status: 'Active', sortOrder: 2 },
    { id: 'o3', name: 'Party', status: 'Active', sortOrder: 3 },
    { id: 'o4', name: 'Office', status: 'Active', sortOrder: 4 },
    { id: 'o5', name: 'Daily Wear', status: 'Active', sortOrder: 5 },
    { id: 'o6', name: 'Festive', status: 'Active', sortOrder: 6 }
  ],
  colors: [
    { id: 'c1', name: 'Pink & Gold', status: 'Active', sortOrder: 1 },
    { id: 'c2', name: 'Emerald Green', status: 'Active', sortOrder: 2 },
    { id: 'c3', name: 'Lavender', status: 'Active', sortOrder: 3 },
    { id: 'c4', name: 'Peach', status: 'Active', sortOrder: 4 },
    { id: 'c5', name: 'Royal Red', status: 'Active', sortOrder: 5 },
    { id: 'c6', name: 'Teal Blue', status: 'Active', sortOrder: 6 }
  ],
  patterns: [
    { id: 'p1', name: 'Zari Woven', status: 'Active', sortOrder: 1 },
    { id: 'p2', name: 'Brocade', status: 'Active', sortOrder: 2 },
    { id: 'p3', name: 'Printed', status: 'Active', sortOrder: 3 },
    { id: 'p4', name: 'Solid Plain', status: 'Active', sortOrder: 4 }
  ],
  weaves: [
    { id: 'w1', name: 'Handloom Weaving', status: 'Active', sortOrder: 1 },
    { id: 'w2', name: 'Jacquard Weaving', status: 'Active', sortOrder: 2 },
    { id: 'w3', name: 'Kadwa Weave', status: 'Active', sortOrder: 3 }
  ],
  borders: [
    { id: 'b1', name: 'Traditional Zari Border', status: 'Active', sortOrder: 1 },
    { id: 'b2', name: 'Temple Border', status: 'Active', sortOrder: 2 },
    { id: 'b3', name: 'Contrast Broad Border', status: 'Active', sortOrder: 3 }
  ],
  brands: [
    { id: 'br1', name: 'Happy Sarees', status: 'Active', sortOrder: 1 },
    { id: 'br2', name: 'Heritage Weaves', status: 'Active', sortOrder: 2 }
  ],
  collections: [
    { id: 'col1', name: 'Wedding Collection', status: 'Active', sortOrder: 1 },
    { id: 'col2', name: 'Bridal Collection', status: 'Active', sortOrder: 2 },
    { id: 'col3', name: 'Festival Collection', status: 'Active', sortOrder: 3 }
  ]
};

const INITIAL_CMS_DATA = {
  announcementBar: {
    enabled: true,
    text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
    link: '/shop',
    backgroundColor: '#2b2b2b',
    textColor: '#ffffff',
    displayOrder: 1
  },
  heroBanner: {
    enabled: true,
    heading: 'Elegance Woven in Tradition',
    subHeading: 'Timeless Sarees for Every Occasion',
    description: 'Discover our exquisite collection of premium sarees crafted with love, tradition, and unmatched quality.',
    primaryBtnText: 'Shop Collection',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'Explore New Arrivals',
    secondaryBtnLink: '/new-arrivals',
    desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=768&q=80',
    displayOrder: 2
  },
  shopByOccasion: {
    enabled: true,
    title: 'Shop By Occasion',
    subtitle: 'Draped In Grandeur',
    selectedOccasions: ['Wedding', 'Reception', 'Party', 'Festive'],
    displayCount: 4,
    displayOrder: 3
  },
  newArrivals: {
    enabled: true,
    displayCount: 4,
    selectionMode: 'auto',
    selectedProducts: [1, 2, 4],
    displayOrder: 4
  },
  featuredCollection: {
    enabled: true,
    title: 'Signature Bridal Heritage',
    subtitle: 'Woven with Gold Threads and Traditions',
    backgroundImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80',
    btnText: 'Explore Curation',
    btnLink: '/shop',
    displayOrder: 5
  },
  bestSellers: {
    enabled: true,
    displayCount: 4,
    selectionMode: 'auto',
    selectedProducts: [1, 2],
    displayOrder: 6
  },
  shopByFabric: {
    enabled: true,
    selectedFabrics: ['Silk', 'Cotton', 'Linen', 'Organza', 'Tissue'],
    displayCount: 5,
    displayOrder: 7
  },
  whyHappySarees: {
    enabled: true,
    cards: [
      { icon: 'Award', title: 'Authentic Handlooms', description: 'Every saree is sourced directly from certified heritage weaver cooperatives.' },
      { icon: 'Shield', title: 'Premium Silk Mark', description: 'Certified genuine fabrics ensuring the highest levels of weave durability.' },
      { icon: 'RefreshCw', title: 'Easy Exchanges', description: 'Hassle-free 15-day return policy and size alterations eligibility.' },
      { icon: 'Smile', title: 'Trusted Legacy', description: 'Draping smiles across generations with royal wedding handlooms.' }
    ],
    displayOrder: 8
  },
  customerReviews: {
    enabled: true,
    reviewCount: 3,
    selectionMode: 'auto',
    selectedReviews: [
      { reviewer: 'Sneha R.', rating: 5, comment: 'Absolutely stunning Banarasi saree. The gold zari work is rich and heavy.' },
      { reviewer: 'Priya S.', rating: 5, comment: 'Lighter than expected and extremely comfortable. The organza floral drapes perfectly!' },
      { reviewer: 'Aditi V.', rating: 4, comment: 'Authentic weave, beautiful packaging. Perfect for the wedding season.' }
    ],
    displayOrder: 9
  },
  watchAndBuy: {
    enabled: true,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80',
    title: 'Traditional Draping Walkthrough',
    displayOrder: 10
  },
  newsletter: {
    enabled: true,
    heading: 'Join Our Royal Newsletter List',
    description: 'Subscribe to receive first access to new collections, exclusive handloom stories, and seasonal sales.',
    placeholder: 'Enter your email address...',
    btnText: 'Subscribe Now',
    displayOrder: 11
  },
  footer: {
    enabled: true,
    quickLinks: [
      { label: 'Shop All', path: '/shop' },
      { label: 'Occasions', path: '/shop' },
      { label: 'Fabrics', path: '/shop' }
    ],
    policies: [
      { label: 'Shipping Policy', path: '/shipping-policy' },
      { label: 'Returns & Exchange', path: '/returns-policy' },
      { label: 'Terms & Conditions', path: '/terms' }
    ],
    socialLinks: [
      { platform: 'Instagram', url: 'https://instagram.com/happysarees' },
      { platform: 'Facebook', url: 'https://facebook.com/happysarees' }
    ],
    copyright: '© 2026 Happy Sarees. Handloom Luxury Woven with Traditions.',
    displayOrder: 12
  }
};

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Royal Kanchipuram Silk Saree',
    slug: 'royal-kanchipuram-silk-saree',
    sku: 'HS001',
    fabric: 'Kanchipuram Silk',
    occasion: 'Wedding',
    price: 6999,
    mrp: 9999,
    discountType: 'percentage',
    discountValue: 30,
    gst: 5,
    costPrice: 4000,
    stock: 25,
    lowStockAlert: 5,
    stockStatus: 'In Stock',
    trackInventory: true,
    allowBackOrders: false,
    barcode: '8901234567890',
    width: '1.1m',
    height: '5.5m',
    weight: '650g',
    blouseIncluded: true,
    blouseSize: '0.8m',
    weave: 'Handloom Weaving',
    border: 'Traditional Zari Border',
    pallu: 'Heavy Golden Zari Pallu',
    pattern: 'Zari Woven',
    color: 'Pink & Gold',
    washCare: 'Dry Clean Only',
    countryOfOrigin: 'India',
    manufacturer: 'Happy Sarees Handloom Co.',
    hsnCode: '5007',
    showOnHomepage: true,
    newArrival: true,
    bestSeller: true,
    featuredCollection: true,
    saleProduct: false,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=saree-video-1',
    seoTitle: 'Royal Kanchipuram Silk Saree - Buy Traditional Wedding Wear',
    metaDescription: 'Shop our premium silk saree woven with genuine golden zari border.',
    keywords: 'kanchipuram silk, pink saree, wedding wear, happy sarees',
    seoUrl: 'royal-kanchipuram-silk-saree',
    canonicalUrl: 'https://happysarees.com/products/royal-kanchipuram-silk-saree',
    openGraphImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    packageLength: '30cm',
    packageWidth: '22cm',
    packageHeight: '8cm',
    shippingClass: 'Express',
    freeShipping: true,
    careInstructions: 'Handle with delicate care. Always fold gently and protect from moisture.',
    returnPolicy: 'Easy 7-day returns on premium catalog items.',
    exchangePolicy: 'Exchanges eligible within 15 days of dispatch.',
    internalNotes: 'Top seller for wedding season. Keep stock levels healthy.',
    createdAt: '12 May 2026',
    updatedAt: '21 Jul 2026'
  },
  {
    id: 2,
    name: 'Peach Organza Printed Floral Saree',
    slug: 'peach-organza-printed-floral-saree',
    sku: 'HS002',
    fabric: 'Organza',
    occasion: 'Party',
    price: 4299,
    mrp: 5999,
    discountType: 'percentage',
    discountValue: 28,
    gst: 5,
    costPrice: 2500,
    stock: 18,
    lowStockAlert: 3,
    stockStatus: 'In Stock',
    trackInventory: true,
    allowBackOrders: false,
    barcode: '8901234567891',
    width: '1.1m',
    height: '5.5m',
    weight: '350g',
    blouseIncluded: true,
    blouseSize: '0.8m',
    weave: 'Jacquard Weaving',
    border: 'Contrast Broad Border',
    pallu: 'Floral Print Soft Pallu',
    pattern: 'Printed',
    color: 'Peach',
    washCare: 'Dry Clean Only',
    countryOfOrigin: 'India',
    manufacturer: 'Happy Sarees Handloom Co.',
    hsnCode: '5007',
    showOnHomepage: true,
    newArrival: true,
    bestSeller: true,
    featuredCollection: false,
    saleProduct: false,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: '',
    seoTitle: 'Peach Organza Printed Floral Saree - Party Collection',
    metaDescription: 'Shop lightweight peach floral print organza saree for evening parties.',
    keywords: 'organza saree, peach saree, party wear, happy sarees',
    seoUrl: 'peach-organza-printed-floral-saree',
    canonicalUrl: 'https://happysarees.com/products/peach-organza-printed-floral-saree',
    openGraphImage: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&q=80',
    packageLength: '30cm',
    packageWidth: '22cm',
    packageHeight: '6cm',
    shippingClass: 'Standard',
    freeShipping: false,
    careInstructions: 'Gentle iron under barrier cloth. Keep away from direct sunlight.',
    returnPolicy: 'Easy 7-day returns on premium catalog items.',
    exchangePolicy: 'Exchanges eligible within 15 days of dispatch.',
    internalNotes: 'Trending among gen-z audience.',
    createdAt: '15 May 2026',
    updatedAt: '21 Jul 2026'
  },
  {
    id: 3,
    name: 'Cotton Daily Wear Saree',
    slug: 'cotton-daily-wear-saree',
    sku: 'HS003',
    fabric: 'Cotton',
    occasion: 'Daily Wear',
    price: 2499,
    mrp: 2999,
    discountType: 'percentage',
    discountValue: 16,
    gst: 5,
    costPrice: 1500,
    stock: 42,
    lowStockAlert: 10,
    stockStatus: 'In Stock',
    trackInventory: true,
    allowBackOrders: true,
    barcode: '8901234567892',
    width: '1.1m',
    height: '5.5m',
    weight: '480g',
    blouseIncluded: false,
    blouseSize: '',
    weave: 'Handloom Weaving',
    border: 'Temple Border',
    pallu: 'Plain Solid Stripe Pallu',
    pattern: 'Solid Plain',
    color: 'Emerald Green',
    washCare: 'Hand Wash cold',
    countryOfOrigin: 'India',
    manufacturer: 'Happy Sarees Handloom Co.',
    hsnCode: '5007',
    showOnHomepage: false,
    newArrival: false,
    bestSeller: false,
    featuredCollection: false,
    saleProduct: false,
    status: 'Draft',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: '',
    seoTitle: 'Cotton Daily Wear Saree - Plain Comfort',
    metaDescription: 'Shop handloomed organic cotton saree for all-day comfort.',
    keywords: 'cotton saree, green saree, casual wear, daily wear',
    seoUrl: 'cotton-daily-wear-saree',
    canonicalUrl: 'https://happysarees.com/products/cotton-daily-wear-saree',
    openGraphImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    packageLength: '28cm',
    packageWidth: '20cm',
    packageHeight: '5cm',
    shippingClass: 'Standard',
    freeShipping: false,
    careInstructions: 'Mild liquid wash recommended. Iron on cotton setting.',
    returnPolicy: 'Eligible for return within 7 days in original condition.',
    exchangePolicy: 'Eligible for size/color exchange.',
    internalNotes: 'Restocked regularly.',
    createdAt: '18 May 2026',
    updatedAt: '20 Jul 2026'
  },
  {
    id: 4,
    name: 'Tissue Silk Saree',
    slug: 'tissue-silk-saree',
    sku: 'HS004',
    fabric: 'Tissue',
    occasion: 'Festive',
    price: 5999,
    mrp: 7999,
    discountType: 'percentage',
    discountValue: 25,
    gst: 5,
    costPrice: 3500,
    stock: 12,
    lowStockAlert: 2,
    stockStatus: 'In Stock',
    trackInventory: true,
    allowBackOrders: false,
    barcode: '8901234567893',
    width: '1.1m',
    height: '5.5m',
    weight: '500g',
    blouseIncluded: true,
    blouseSize: '0.8m',
    weave: 'Kadwa Weave',
    border: 'Contrast Broad Border',
    pallu: 'Heavy Tissue Golden Pallu',
    pattern: 'Zari Woven',
    color: 'Lavender',
    washCare: 'Dry Clean Only',
    countryOfOrigin: 'India',
    manufacturer: 'Happy Sarees Handloom Co.',
    hsnCode: '5007',
    showOnHomepage: true,
    newArrival: false,
    bestSeller: true,
    featuredCollection: true,
    saleProduct: true,
    status: 'Published',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    ],
    videoUrl: '',
    seoTitle: 'Tissue Silk Saree - Metallic Shimmer Collection',
    metaDescription: 'Shop our sheer gold zari woven tissue silk saree.',
    keywords: 'tissue saree, silk, gold zari, festive drapes',
    seoUrl: 'tissue-silk-saree',
    canonicalUrl: 'https://happysarees.com/products/tissue-silk-saree',
    openGraphImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    packageLength: '30cm',
    packageWidth: '22cm',
    packageHeight: '8cm',
    shippingClass: 'Express',
    freeShipping: true,
    careInstructions: 'Store in soft muslin wrap. Avoid perfumes directly on fabric.',
    returnPolicy: 'Premium items are eligible for 7-day returns.',
    exchangePolicy: 'Exchange within 15 days.',
    internalNotes: 'Limited supply.',
    createdAt: '20 May 2026',
    updatedAt: '20 Jul 2026'
  }
];

export function AdminDataProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('hs_admin_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [masterData, setMasterData] = useState(() => {
    const saved = localStorage.getItem('hs_admin_master_data');
    return saved ? JSON.parse(saved) : INITIAL_MASTER_DATA;
  });

  const [cmsData, setCmsData] = useState(() => {
    const saved = localStorage.getItem('hs_admin_cms_data');
    return saved ? JSON.parse(saved) : INITIAL_CMS_DATA;
  });

  useEffect(() => {
    localStorage.setItem('hs_admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hs_admin_master_data', JSON.stringify(masterData));
  }, [masterData]);

  useEffect(() => {
    localStorage.setItem('hs_admin_cms_data', JSON.stringify(cmsData));
  }, [cmsData]);

  // Product CRUD
  const addProduct = (product) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatted = {
      ...product,
      id: newId,
      createdAt: dateStr,
      updatedAt: dateStr
    };
    setProducts([formatted, ...products]);
    return formatted;
  };

  const updateProduct = (id, updatedProduct) => {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setProducts(products.map(p => p.id === Number(id) ? { ...p, ...updatedProduct, updatedAt: dateStr } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== Number(id)));
  };

  const duplicateProduct = (id) => {
    const target = products.find(p => p.id === Number(id));
    if (target) {
      const copy = {
        ...target,
        name: `${target.name} (Copy)`,
        sku: `${target.sku}-COPY`,
        slug: `${target.slug}-copy`
      };
      addProduct(copy);
    }
  };

  // Master Data CRUD
  const addMasterItem = (type, item) => {
    const items = masterData[type] || [];
    const newId = `${type.charAt(0)}${items.length + 1}_${Date.now()}`;
    const newItem = {
      id: newId,
      name: item.name,
      status: item.status || 'Active',
      sortOrder: Number(item.sortOrder) || (items.length + 1)
    };
    setMasterData({
      ...masterData,
      [type]: [...items, newItem]
    });
  };

  const updateMasterItem = (type, itemId, updatedFields) => {
    const items = masterData[type] || [];
    setMasterData({
      ...masterData,
      [type]: items.map(item => item.id === itemId ? { ...item, ...updatedFields } : item)
    });
  };

  const deleteMasterItem = (type, itemId) => {
    const items = masterData[type] || [];
    setMasterData({
      ...masterData,
      [type]: items.filter(item => item.id !== itemId)
    });
  };

  const addMasterType = (typeName) => {
    const key = typeName.toLowerCase().replace(/\s+/g, '_');
    if (!masterData[key]) {
      setMasterData({
        ...masterData,
        [key]: []
      });
    }
  };

  return (
    <AdminDataContext.Provider
      value={{
        products,
        setProducts,
        masterData,
        cmsData,
        setCmsData,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addMasterItem,
        updateMasterItem,
        deleteMasterItem,
        addMasterType
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
