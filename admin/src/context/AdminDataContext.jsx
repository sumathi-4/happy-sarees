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

const INITIAL_ORDERS = [
  {
    id: 'HS10001',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: '123, MG Road, Anna Nagar, Chennai, Tamil Nadu - 600040, India',
    billingAddress: '123, MG Road, Anna Nagar, Chennai, Tamil Nadu - 600040, India',
    products: [
      { id: 1, name: 'Royal Kanchipuram Silk Saree', fabric: 'Kanchipuram Silk', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80', qty: 1, price: 6999, discount: 250, total: 6749, sku: 'HS-KANC-001' },
      { id: 2, name: 'Organza Floral Saree', fabric: 'Organza', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', qty: 1, price: 2199, discount: 200, total: 1999, sku: 'HS-ORG-002' },
      { id: 3, name: 'Cotton Daily Wear Saree', fabric: 'Cotton', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80', qty: 1, price: 1499, discount: 150, total: 1349, sku: 'HS-COT-003' }
    ],
    subtotal: 6197,
    discount: 619.70,
    shipping: 120,
    gst: 301.70,
    totalAmount: 6999,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    transactionId: 'pay_J3K8dK2L09nQ1B',
    paidOn: '12 May 2026, 10:31 AM',
    orderStatus: 'Shipped',
    deliveryStatus: 'In Transit',
    orderDate: '12 May 2026, 10:30 AM',
    courier: 'Delhivery',
    trackingNumber: '149875698745',
    dispatchDate: '12 May 2026',
    deliveryDate: '14 May 2026 (Expected)',
    timeline: [
      { status: 'Order Placed', time: '12 May 2026, 10:30 AM', completed: true },
      { status: 'Payment Received', time: '12 May 2026, 10:31 AM', completed: true },
      { status: 'Packed', time: '12 May 2026, 01:45 PM', completed: true },
      { status: 'Shipped', time: '12 May 2026, 06:15 PM', completed: true },
      { status: 'Delivered', time: '14 May 2026 (Expected)', completed: false }
    ],
    adminNotes: 'Customer requested gift wrapping.',
    activityLog: [
      'Order placed by client.',
      'Payment verified via Razorpay.',
      'Packed at main warehouse.',
      'Assigned to Delhivery with AWB 149875698745.'
    ]
  },
  {
    id: 'HS10002',
    customerName: 'Kavya Reddy',
    customerEmail: 'kavya.reddy@example.com',
    customerPhone: '+91 91234 56789',
    shippingAddress: '45, Jubilee Hills, Road No 5, Hyderabad, Telangana - 500033, India',
    billingAddress: '45, Jubilee Hills, Road No 5, Hyderabad, Telangana - 500033, India',
    products: [
      { id: 4, name: 'Tissue Silk Saree', fabric: 'Tissue', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', qty: 1, price: 3499, discount: 0, total: 3499, sku: 'HS-TIS-004' }
    ],
    subtotal: 3499,
    discount: 0,
    shipping: 0,
    gst: 175,
    totalAmount: 3499,
    paymentMethod: 'COD',
    paymentStatus: 'COD',
    transactionId: '-',
    paidOn: '-',
    orderStatus: 'Pending',
    deliveryStatus: 'Not Processed',
    orderDate: '12 May 2026, 09:15 AM',
    courier: 'Not Assigned',
    trackingNumber: '-',
    dispatchDate: '-',
    deliveryDate: '-',
    timeline: [
      { status: 'Order Placed', time: '12 May 2026, 09:15 AM', completed: true },
      { status: 'Payment Confirmed', time: '-', completed: false },
      { status: 'Packed', time: '-', completed: false },
      { status: 'Shipped', time: '-', completed: false },
      { status: 'Delivered', time: '-', completed: false }
    ],
    adminNotes: 'Call to confirm address before shipping.',
    activityLog: [
      'Order placed via Cash on Delivery.'
    ]
  },
  {
    id: 'HS10003',
    customerName: 'Anitha Iyer',
    customerEmail: 'anitha.iyer@example.com',
    customerPhone: '+91 99887 66554',
    shippingAddress: '78, Malleshwaram 15th Cross, Bangalore, Karnataka - 560003, India',
    billingAddress: '78, Malleshwaram 15th Cross, Bangalore, Karnataka - 560003, India',
    products: [
      { id: 2, name: 'Organza Floral Saree', fabric: 'Organza', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', qty: 2, price: 2649, discount: 0, total: 5298, sku: 'HS-ORG-002' }
    ],
    subtotal: 5298,
    discount: 0,
    shipping: 0,
    gst: 265,
    totalAmount: 5299,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    transactionId: 'pay_K8dK2L09nQ1B3X',
    paidOn: '11 May 2026, 03:46 PM',
    orderStatus: 'Delivered',
    deliveryStatus: 'Delivered',
    orderDate: '11 May 2026, 03:45 PM',
    courier: 'BlueDart',
    trackingNumber: '789562314',
    dispatchDate: '11 May 2026',
    deliveryDate: '13 May 2026',
    timeline: [
      { status: 'Order Placed', time: '11 May 2026, 03:45 PM', completed: true },
      { status: 'Payment Received', time: '11 May 2026, 03:46 PM', completed: true },
      { status: 'Packed', time: '11 May 2026, 05:00 PM', completed: true },
      { status: 'Shipped', time: '12 May 2026, 10:00 AM', completed: true },
      { status: 'Delivered', time: '13 May 2026, 04:30 PM', completed: true }
    ],
    adminNotes: 'Leave at front desk if unavailable.',
    activityLog: [
      'Order placed.',
      'Payment verified.',
      'Shipped via BlueDart.',
      'Delivered successfully. Signature received.'
    ]
  },
  {
    id: 'HS10004',
    customerName: 'Meena Joshi',
    customerEmail: 'meena.joshi@example.com',
    customerPhone: '+91 90011 22334',
    shippingAddress: 'A-402, Shanti Vihar, Andheri West, Mumbai, Maharashtra - 400053, India',
    billingAddress: 'A-402, Shanti Vihar, Andheri West, Mumbai, Maharashtra - 400053, India',
    products: [
      { id: 3, name: 'Cotton Daily Wear Saree', fabric: 'Cotton', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80', qty: 2, price: 1449, discount: 0, total: 2898, sku: 'HS-COT-003' }
    ],
    subtotal: 2898,
    discount: 0,
    shipping: 0,
    gst: 145,
    totalAmount: 2899,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    transactionId: 'upi_985623147856@okaxis',
    paidOn: '11 May 2026, 05:21 PM',
    orderStatus: 'Packed',
    deliveryStatus: 'Ready to Ship',
    orderDate: '11 May 2026, 05:20 PM',
    courier: 'Delhivery',
    trackingNumber: '895632145',
    dispatchDate: '-',
    deliveryDate: '-',
    timeline: [
      { status: 'Order Placed', time: '11 May 2026, 05:20 PM', completed: true },
      { status: 'Payment Received', time: '11 May 2026, 05:21 PM', completed: true },
      { status: 'Packed', time: '12 May 2026, 09:30 AM', completed: true },
      { status: 'Shipped', time: '-', completed: false },
      { status: 'Delivered', time: '-', completed: false }
    ],
    adminNotes: '',
    activityLog: [
      'Order placed.',
      'UPI payment verified.',
      'Packed and ready for pickup.'
    ]
  },
  {
    id: 'HS10005',
    customerName: 'Sneha Menon',
    customerEmail: 'sneha.menon@example.com',
    customerPhone: '+91 93456 77890',
    shippingAddress: '12, Marine Drive, Kochi, Kerala - 682031, India',
    billingAddress: '12, Marine Drive, Kochi, Kerala - 682031, India',
    products: [
      { id: 1, name: 'Royal Kanchipuram Silk Saree', fabric: 'Kanchipuram Silk', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80', qty: 1, price: 6999, discount: 0, total: 6999, sku: 'HS-KANC-001' },
      { id: 3, name: 'Cotton Daily Wear Saree', fabric: 'Cotton', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80', qty: 2, price: 1400, discount: 0, total: 2800, sku: 'HS-COT-003' }
    ],
    subtotal: 9799,
    discount: 0,
    shipping: 0,
    gst: 490,
    totalAmount: 9799,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Paid',
    transactionId: 'pay_M9dK2L09nQ1B5Y',
    paidOn: '10 May 2026, 03:11 PM',
    orderStatus: 'Out for Delivery',
    deliveryStatus: 'Out for Delivery',
    orderDate: '10 May 2026, 03:10 PM',
    courier: 'Delhivery',
    trackingNumber: '149875698888',
    dispatchDate: '11 May 2026',
    deliveryDate: '12 May 2026',
    timeline: [
      { status: 'Order Placed', time: '10 May 2026, 03:10 PM', completed: true },
      { status: 'Payment Received', time: '10 May 2026, 03:11 PM', completed: true },
      { status: 'Packed', time: '10 May 2026, 06:00 PM', completed: true },
      { status: 'Shipped', time: '11 May 2026, 09:00 AM', completed: true },
      { status: 'Delivered', time: 'Out for Delivery', completed: false }
    ],
    adminNotes: 'Call before delivery.',
    activityLog: [
      'Order placed.',
      'Payment verified.',
      'Shipped.',
      'Out for delivery from local Kochi hub.'
    ]
  },
  {
    id: 'HS10006',
    customerName: 'Pooja Singh',
    customerEmail: 'pooja.singh@example.com',
    customerPhone: '+91 87654 32109',
    shippingAddress: 'Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh - 201012, India',
    billingAddress: 'Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh - 201012, India',
    products: [
      { id: 2, name: 'Organza Floral Saree', fabric: 'Organza', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', qty: 1, price: 1999, discount: 0, total: 1999, sku: 'HS-ORG-002' }
    ],
    subtotal: 1999,
    discount: 0,
    shipping: 0,
    gst: 100,
    totalAmount: 1999,
    paymentMethod: 'COD',
    paymentStatus: 'COD',
    transactionId: '-',
    paidOn: '-',
    orderStatus: 'Cancelled',
    deliveryStatus: 'Cancelled',
    orderDate: '10 May 2026, 11:05 AM',
    courier: 'Not Assigned',
    trackingNumber: '-',
    dispatchDate: '-',
    deliveryDate: '-',
    timeline: [
      { status: 'Order Placed', time: '10 May 2026, 11:05 AM', completed: true },
      { status: 'Cancelled', time: '10 May 2026, 12:00 PM', completed: true }
    ],
    adminNotes: 'Customer cancelled via support call.',
    activityLog: [
      'Order placed via COD.',
      'Cancelled by customer due to double order.'
    ]
  },
  {
    id: 'HS10007',
    customerName: 'Nandhini K',
    customerEmail: 'nandhini.k@example.com',
    customerPhone: '+91 96876 54321',
    shippingAddress: 'Flat 102, Gokulam Apartments, Mysore, Karnataka - 570002, India',
    billingAddress: 'Flat 102, Gokulam Apartments, Mysore, Karnataka - 570002, India',
    products: [
      { id: 4, name: 'Tissue Silk Saree', fabric: 'Tissue', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=100&q=80', qty: 1, price: 4499, discount: 0, total: 4499, sku: 'HS-TIS-004' }
    ],
    subtotal: 4499,
    discount: 0,
    shipping: 0,
    gst: 225,
    totalAmount: 4499,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Refunded',
    transactionId: 'pay_N9dK2L09nQ1B5Z',
    paidOn: '09 May 2026, 07:30 PM',
    orderStatus: 'Returned',
    deliveryStatus: 'Returned',
    orderDate: '09 May 2026, 07:30 PM',
    courier: 'BlueDart',
    trackingNumber: '789563214',
    dispatchDate: '10 May 2026',
    deliveryDate: '12 May 2026',
    timeline: [
      { status: 'Order Placed', time: '09 May 2026, 07:30 PM', completed: true },
      { status: 'Payment Received', time: '09 May 2026, 07:30 PM', completed: true },
      { status: 'Shipped', time: '10 May 2026', completed: true },
      { status: 'Delivered', time: '12 May 2026', completed: true },
      { status: 'Returned', time: '14 May 2026', completed: true }
    ],
    adminNotes: 'Returned due to shade mismatch. Refund initiated.',
    activityLog: [
      'Order placed.',
      'Payment verified.',
      'Delivered.',
      'Return request approved.',
      'Refund processed for ₹4,499.'
    ]
  },
  {
    id: 'HS10008',
    customerName: 'Lakshmi B',
    customerEmail: 'lakshmi.b@example.com',
    customerPhone: '+91 78901 23456',
    shippingAddress: 'Sector 4, Dwarka, New Delhi - 110075, India',
    billingAddress: 'Sector 4, Dwarka, New Delhi - 110075, India',
    products: [
      { id: 3, name: 'Cotton Daily Wear Saree', fabric: 'Cotton', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=100&q=80', qty: 2, price: 1649, discount: 0, total: 3298, sku: 'HS-COT-003' }
    ],
    subtotal: 3298,
    discount: 0,
    shipping: 0,
    gst: 165,
    totalAmount: 3299,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    transactionId: 'upi_785623147856@okicici',
    paidOn: '09 May 2026, 05:00 PM',
    orderStatus: 'Confirmed',
    deliveryStatus: 'Not Processed',
    orderDate: '09 May 2026, 05:00 PM',
    courier: 'Not Assigned',
    trackingNumber: '-',
    dispatchDate: '-',
    deliveryDate: '-',
    timeline: [
      { status: 'Order Placed', time: '09 May 2026, 05:00 PM', completed: true },
      { status: 'Confirmed', time: '09 May 2026, 06:30 PM', completed: true },
      { status: 'Packed', time: '-', completed: false }
    ],
    adminNotes: '',
    activityLog: [
      'Order placed.',
      'UPI payment verified.',
      'Order confirmed by staff.'
    ]
  }
];
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

const INITIAL_CUSTOMERS = [];

const INITIAL_COUPONS = [
  {
    code: 'HAPPY10',
    type: 'Percentage',
    discount: '10% OFF',
    discountValue: 10,
    minOrder: 1500,
    maxDiscount: 500,
    usageLimit: 100,
    usageCount: 82,
    perUserLimit: 1,
    startDate: '01 Jan 2026',
    expiryDate: '30 Dec 2026',
    status: 'Active'
  },
  {
    code: 'FESTIVE500',
    type: 'Flat',
    discount: '₹500 OFF',
    discountValue: 500,
    minOrder: 3000,
    maxDiscount: 500,
    usageLimit: 200,
    usageCount: 31,
    perUserLimit: 1,
    startDate: '10 May 2026',
    expiryDate: '20 Nov 2026',
    status: 'Active'
  },
  {
    code: 'FIRSTORDER',
    type: 'Percentage',
    discount: '15% OFF',
    discountValue: 15,
    minOrder: 999,
    maxDiscount: 300,
    usageLimit: 500,
    usageCount: 15,
    perUserLimit: 1,
    startDate: '01 Jan 2026',
    expiryDate: '31 Dec 2026',
    status: 'Active'
  },
  {
    code: 'WELCOME20',
    type: 'Percentage',
    discount: '20% OFF',
    discountValue: 20,
    minOrder: 2000,
    maxDiscount: 400,
    usageLimit: 150,
    usageCount: 12,
    perUserLimit: 2,
    startDate: '01 Jun 2026',
    expiryDate: '15 Aug 2026',
    status: 'Inactive'
  }
];

const INITIAL_NOTIFS = [
  {
    id: 1,
    type: 'order',
    title: 'New Order Received',
    message: 'Order HS10015 has been placed.',
    time: '09:15 AM',
    read: false
  },
  {
    id: 2,
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Soft Silk Saree stock is low (5 left).',
    time: 'Yesterday',
    read: false
  },
  {
    id: 3,
    type: 'coupon',
    title: 'Coupon Expiring Soon',
    message: 'Coupon FESTIVE500 will expire in 3 days.',
    time: 'Yesterday',
    read: false
  },
  {
    id: 4,
    type: 'customer',
    title: 'New Customer Registered',
    message: 'Anusha Reddy has registered.',
    time: 'Yesterday',
    read: true
  },
  {
    id: 5,
    type: 'payment',
    title: 'Payment Failed',
    message: 'Payment failed for Order HS10014.',
    time: 'Yesterday',
    read: true
  },
  {
    id: 6,
    type: 'cancel',
    title: 'Order Cancelled',
    message: 'Order HS10013 has been cancelled.',
    time: '2 days ago',
    read: true
  }
];

export function AdminDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [masterData, setMasterData] = useState(INITIAL_MASTER_DATA);
  const [cmsData, setCmsData] = useState(INITIAL_CMS_DATA);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Live Database Fetchers (Neon PostgreSQL Single Source of Truth)
  const refreshCustomers = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawList = Array.isArray(data.data?.customers) ? data.data.customers : (Array.isArray(data.data) ? data.data : (Array.isArray(data.customers) ? data.customers : []));
      if (data.success && Array.isArray(rawList)) {
        const formatted = rawList.map(c => ({
          id: c.id,
          name: c.name || 'Customer',
          email: c.email,
          phone: c.phone || 'N/A',
          totalOrders: c.orderCount || 0,
          totalSpent: c.totalSpent || 0,
          status: c.isBlocked ? 'Blocked' : 'Active',
          joinedDate: new Date(c.joinedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          avatar: c.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          address: c.address || 'Address registered on checkout',
          notes: c.blockReason ? `Blocked reason: ${c.blockReason}` : 'Registered customer',
          isBlocked: !!c.isBlocked
        }));

        setCustomers(formatted);
        return formatted;
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch customers error:', err.message);
    }
  };

  const refreshProducts = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawList = Array.isArray(data.data?.products) ? data.data.products : (Array.isArray(data.data) ? data.data : (Array.isArray(data.products) ? data.products : []));
      if (data.success && Array.isArray(rawList)) {
        setProducts(rawList);
        return rawList;
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch products error:', err.message);
    }
  };

  const refreshOrders = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawList = Array.isArray(data.data?.orders) ? data.data.orders : (Array.isArray(data.data) ? data.data : (Array.isArray(data.orders) ? data.orders : []));
      if (data.success && Array.isArray(rawList)) {
        setOrders(rawList);
        return rawList;
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch orders error:', err.message);
    }
  };

  const refreshCoupons = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawList = Array.isArray(data.data?.coupons) ? data.data.coupons : (Array.isArray(data.data) ? data.data : (Array.isArray(data.coupons) ? data.coupons : []));
      if (data.success && Array.isArray(rawList)) {
        setCoupons(rawList);
        return rawList;
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch coupons error:', err.message);
    }
  };

  const refreshNotifications = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawList = Array.isArray(data.data?.notifications) ? data.data.notifications : (Array.isArray(data.data) ? data.data : (Array.isArray(data.notifications) ? data.notifications : []));
      if (data.success && Array.isArray(rawList)) {
        setNotifications(rawList);
        return rawList;
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch notifications error:', err.message);
    }
  };

  const refreshCms = async () => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/cms/sections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const rawSections = data.sections || [];
      if (data.success && Array.isArray(rawSections) && rawSections.length > 0) {
        setCmsData(prev => {
          const nextCms = { ...prev };
          rawSections.forEach(sec => {
            const key = sec.section_key;
            let camelKey = key;
            if (key === 'announcement_bar') camelKey = 'announcementBar';
            else if (key === 'hero_banner') camelKey = 'heroBanner';
            else if (key === 'shop_by_occasion') camelKey = 'shopByOccasion';
            else if (key === 'new_arrivals') camelKey = 'newArrivals';
            else if (key === 'featured_collection') camelKey = 'featuredCollection';
            else if (key === 'best_sellers') camelKey = 'bestSellers';
            else if (key === 'shop_by_fabric') camelKey = 'shopByFabric';
            else if (key === 'why_happy_sarees') camelKey = 'whyHappySarees';
            else if (key === 'customer_reviews') camelKey = 'customerReviews';
            else if (key === 'watch_and_buy') camelKey = 'watchAndBuy';

            const configObj = sec.config || {};
            nextCms[camelKey] = {
              ...nextCms[camelKey],
              ...configObj,
              enabled: sec.is_active !== undefined ? sec.is_active : (sec.enabled ?? true)
            };
          });
          return nextCms;
        });
      }
    } catch (err) {
      console.log('[AdminDataContext] Fetch CMS error:', err.message);
    }
  };

  const updateCmsSection = async (sectionKey, sectionData) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const snakeKey = sectionKey.replace(/([A-Z])/g, "_$1").toLowerCase();
      await fetch(`http://localhost:5001/api/admin/cms/sections/${snakeKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sectionData)
      });
    } catch (err) {
      console.log('[AdminDataContext] Update CMS section error:', err.message);
    }

    setCmsData(prev => ({
      ...prev,
      [sectionKey]: { ...sectionData }
    }));
  };

  useEffect(() => {
    refreshCustomers();
    refreshProducts();
    refreshOrders();
    refreshCoupons();
    refreshNotifications();
    refreshCms();
  }, []);

  useEffect(() => {
    // Clear any obsolete local storage entries to enforce Neon Cloud PostgreSQL as single source of truth
    try {
      localStorage.removeItem('hs_admin_products');
      localStorage.removeItem('hs_admin_master_data');
      localStorage.removeItem('hs_admin_cms_data');
      localStorage.removeItem('hs_admin_orders');
      localStorage.removeItem('hs_admin_coupons');
      localStorage.removeItem('hs_admin_notifications');
    } catch (e) {
      // Ignore
    }
  }, []);

  // Product CRUD (Connected to Neon Cloud PostgreSQL DB)
  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      const res = await fetch('http://localhost:5001/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      await refreshProducts();
      return data.data?.product;
    } catch (err) {
      console.log('[AdminDataContext] Add product API error:', err.message);
    }
  };

  const updateProduct = async (id, updatedProductData) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProductData)
      });
      await refreshProducts();
    } catch (err) {
      console.log('[AdminDataContext] Update product API error:', err.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshProducts();
    } catch (err) {
      console.log('[AdminDataContext] Delete product API error:', err.message);
    }
  };

  const bulkActionProducts = async (ids, action) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch('http://localhost:5001/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids, action })
      });
      await refreshProducts();
    } catch (err) {
      console.log('[AdminDataContext] Bulk action API error:', err.message);
    }
  };

  const duplicateProduct = async (id) => {
    const target = products.find(p => p.id === Number(id));
    if (target) {
      const copy = {
        ...target,
        name: `${target.name} (Copy)`,
        sku: `${target.sku}-COPY`,
        slug: `${target.slug}-copy`
      };
      await addProduct(copy);
    }
  };

  // Master Data CRUD (Connected to Neon Cloud PostgreSQL DB)
  const addMasterItem = async (type, item) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/master-data/types/${type}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(item)
      });
      await refreshMasterData();
    } catch (err) {
      console.log('[AdminDataContext] Add master item error:', err.message);
      const items = masterData[type] || [];
      const newId = `${type.charAt(0)}${items.length + 1}_${Date.now()}`;
      const newItem = { id: newId, name: item.name, status: item.status || 'Active', sortOrder: Number(item.sortOrder) || (items.length + 1) };
      setMasterData({ ...masterData, [type]: [...items, newItem] });
    }
  };

  const updateMasterItem = async (type, itemId, updatedFields) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/master-data/types/${type}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      await refreshMasterData();
    } catch (err) {
      console.log('[AdminDataContext] Update master item error:', err.message);
      const items = masterData[type] || [];
      setMasterData({ ...masterData, [type]: items.map(item => item.id === itemId ? { ...item, ...updatedFields } : item) });
    }
  };

  const deleteMasterItem = async (type, itemId) => {
    try {
      const token = localStorage.getItem('hs_admin_token') || 'demo_token';
      await fetch(`http://localhost:5001/api/admin/master-data/types/${type}/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshMasterData();
    } catch (err) {
      console.log('[AdminDataContext] Delete master item error:', err.message);
      const items = masterData[type] || [];
      setMasterData({ ...masterData, [type]: items.filter(item => item.id !== itemId) });
    }
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
        refreshProducts,
        masterData,
        cmsData,
        setCmsData,
        refreshCms,
        updateCmsSection,
        orders,
        setOrders,
        refreshOrders,
        customers,
        setCustomers,
        refreshCustomers,
        coupons,
        setCoupons,
        refreshCoupons,
        notifications,
        setNotifications,
        refreshNotifications,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        bulkActionProducts,
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
