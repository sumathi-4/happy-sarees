// Premium Mock Data for Happy Sarees

// 1. Announcement Messages
export const ANNOUNCEMENT_MESSAGES = [
  "✨ Festive Special: Free Shipping on all orders above ₹999",
  "🌸 Easy 7-Day Returns & Exchanges",
  "👑 Exclusive Bridal Royal Saree Collection Now Live",
  "💫 Cash on Delivery available on all orders"
];

// 2. Hero Slides
export const HERO_SLIDES = [
  {
    id: 1,
    title: "Elegant Sarees",
    subtitle: "TIMELESS BEAUTY",
    boldTitle: "for Every Occasion",
    description: "Discover our exclusive range of premium sarees, crafted for every moment of your life. From rich traditional weaves to lightweight contemporary designs, find your perfect grace.",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
    primaryCta: "Shop Now",
    secondaryCta: "Explore Collections"
  }
];

// 3. Signature Collections (Lifestyle Curated)
export const SIGNATURE_COLLECTIONS = [
  {
    id: 1,
    title: "Wedding Elegance",
    subtitle: "WEDDING COLLECTION",
    description: "Celebrate your grand celebrations with our majestic traditional weaves.",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    ctaText: "Explore Collection"
  },
  {
    id: 2,
    title: "Bridal Royal",
    subtitle: "BRIDAL COLLECTION",
    description: "Look like royalty on your special day in our handwoven pure zaris.",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    ctaText: "Explore Collection"
  },
  {
    id: 3,
    title: "Festival Glamour",
    subtitle: "FESTIVE COLLECTION",
    description: "Dazzle in vibrant, sparkling threads crafted for auspicious occasions.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
    ctaText: "Explore Collection"
  },
  {
    id: 4,
    title: "Office Grace",
    subtitle: "CASUAL & WORK WEAR",
    description: "Stay comfortable and elegant with lightweight prints and breathy cottons.",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    ctaText: "Explore Collection"
  }
];

// 4. Shop By Category
export const CATEGORIES = [
  {
    id: 1,
    title: "Silk Sarees",
    count: "150+ Products",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
    path: "/shop?category=silk"
  },
  {
    id: 2,
    title: "Cotton Sarees",
    count: "95+ Products",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    path: "/shop?category=cotton"
  },
  {
    id: 3,
    title: "Designer Sarees",
    count: "120+ Products",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop",
    path: "/shop?category=designer"
  },
  {
    id: 4,
    title: "Banarasi",
    count: "80+ Products",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    path: "/shop?category=banarasi"
  },
  {
    id: 5,
    title: "Kanchipuram",
    count: "110+ Products",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    path: "/shop?category=kanchipuram"
  },
  {
    id: 6,
    title: "Organza",
    count: "70+ Products",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    path: "/shop?category=organza"
  }
];

// 5. Products (Loaded 100% Dynamically from Neon PostgreSQL DB)
export const PRODUCTS = [];

// 6. Shop By Fabric
export const FABRICS = [
  {
    id: 1,
    name: "Silk",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=150&auto=format&fit=crop",
    path: "/shop?fabric=silk"
  },
  {
    id: 2,
    name: "Cotton",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=150&auto=format&fit=crop",
    path: "/shop?fabric=cotton"
  },
  {
    id: 3,
    name: "Chiffon",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=150&auto=format&fit=crop",
    path: "/shop?fabric=chiffon"
  },
  {
    id: 4,
    name: "Tissue",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    path: "/shop?fabric=tissue"
  },
  {
    id: 5,
    name: "Linen",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=150&auto=format&fit=crop",
    path: "/shop?fabric=linen"
  },
  {
    id: 6,
    name: "Georgette",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    path: "/shop?fabric=georgette"
  }
];

// 7. Why Choose Us (Why Happy Sarees)
export const WHY_CHOOSE_US = [
  {
    id: 1,
    title: "Premium Quality",
    subtitle: "Finest craftsmanship",
    description: "Every saree is hand-inspected for weaving precision, fabric weight, and embroidery perfection."
  },
  {
    id: 2,
    title: "Secure Payment",
    subtitle: "100% safe & secure transactions",
    description: "SSL encrypted gateways and safe credit/debit/wallet integrations for secure shopping."
  },
  {
    id: 3,
    title: "Easy Returns",
    subtitle: "Hassle-free return policy",
    description: "Not satisfied? Get a prompt return or replacement within 7 days of delivery."
  },
  {
    id: 4,
    title: "Free Shipping",
    subtitle: "On orders above ₹999",
    description: "Prompt delivery with express transit service partner updates directly to your phone."
  }
];

// 8. Testimonials (Customer Reviews)
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Ananya Sharma",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop",
    rating: 5,
    comment: "The saree quality is excellent! Beautiful fabric and perfect packaging. Will buy again!"
  },
  {
    id: 2,
    name: "Priya Nair",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    rating: 5,
    comment: "Loved the collection! The colors are exactly as shown. Highly recommend Happy Sarees."
  },
  {
    id: 3,
    name: "Sneha Iyer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=100&auto=format&fit=crop",
    rating: 5,
    comment: "Fast delivery and amazing customer service. Will shop again for upcoming festival!"
  }
];

// 9. Watch & Buy (Instagram/Lifestyle Videos)
export const WATCH_AND_BUY_VIDEOS = [
  {
    id: 1,
    title: "How to Drape Silk Saree",
    duration: "02:45",
    thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
    productId: "p1"
  },
  {
    id: 2,
    title: "Banarasi Saree Showcase",
    duration: "01:58",
    thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    productId: "p5"
  },
  {
    id: 3,
    title: "Festive Look Ideas",
    duration: "03:20",
    thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    productId: "p3"
  },
  {
    id: 4,
    title: "Saree Styling Tips",
    duration: "02:10",
    thumbnail: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop",
    productId: "p2"
  },
  {
    id: 5,
    title: "Wedding Saree Guide",
    duration: "02:05",
    thumbnail: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    productId: "p6"
  }
];

// 10. Sample Product Details Data for Product Details Page
export const SAMPLE_PRODUCT_DETAIL = {
  id: "kanchipuram-pure-silk",
  name: "Kanchipuram Pure Silk Saree",
  rating: 4.8,
  reviewCount: 248,
  price: 6999,
  originalPrice: 8999,
  discountBadge: "22% OFF",
  fabric: "Kanchipuram Silk",
  width: "48 Inches",
  height: "6.2 Meters",
  blouseIncluded: true,
  blouseSize: "0.8 Meter",
  color: "Magenta",
  pattern: "Traditional Zari",
  occasion: "Wedding",
  weave: "Handloom",
  border: "Zari Woven",
  pallu: "Traditional Zari Pallu",
  blouseType: "Running Blouse",
  weight: "650 Grams",
  countryOfOrigin: "India",
  sku: "HS-KAN-1024",
  inStock: true,
  stockCount: 8,
  images: [
    "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
    "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
    "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
    "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
  ],
  description: "This exquisite Kanchipuram Pure Silk Saree is a timeless masterpiece woven with rich zari motifs. The vibrant magenta body and grand golden border make it a perfect choice for weddings and festive occasions. Crafted by skilled weavers, it reflects the heritage and elegance of South India.",
  washCare: "Dry Clean Only. Store in a breathable cotton saree bag. Keep away from direct moisture and perfume sprays to preserve zari sheen.",
  shippingReturns: "Dispatched within 24-48 hours. Free express shipping across India on orders above ₹999. Easy 7-day returns & exchange policy.",
  videos: [
    {
      id: 1,
      title: "How to drape Kanchipuram Silk Saree perfectly",
      duration: "02:45",
      thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
    },
    {
      id: 2,
      title: "Kanchipuram Silk Saree Details & Quality",
      duration: "01:32",
      thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
    },
    {
      id: 3,
      title: "Perfect Saree for Wedding Season",
      duration: "03:10",
      thumbnail: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
    }
  ],
  reviewsList: [
    {
      id: 101,
      name: "Priya Sharma",
      verified: true,
      date: "2 Days ago",
      rating: 5,
      comment: "Absolutely stunning saree! The quality is exceptional and the color is exactly as shown. Perfect for my sister's wedding.",
      photos: [
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
      ]
    },
    {
      id: 102,
      name: "Anitha Krishnan",
      verified: true,
      date: "1 Week ago",
      rating: 5,
      comment: "Pure silk feel and beautiful zari work. Packaging was excellent. Highly recommended!",
      photos: [
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
      ]
    },
    {
      id: 103,
      name: "Meera Iyer",
      verified: true,
      date: "2 Weeks ago",
      rating: 5,
      comment: "Very elegant and traditional look. Received so many compliments! Worth every penny.",
      photos: [
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
      ]
    }
  ],
  relatedProducts: [
    {
      id: "rel1",
      name: "Kanchipuram Silk Saree",
      colorTag: "Peacock Blue",
      price: 7299,
      originalPrice: 7900,
      rating: 4.7,
      ratingCount: 96,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: "rel2",
      name: "Banarasi Silk Saree",
      colorTag: "Rani Pink",
      price: 6499,
      originalPrice: 6900,
      rating: 4.6,
      ratingCount: 78,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
    },
    {
      id: "rel3",
      name: "Soft Silk Saree",
      colorTag: "Light Green",
      price: 4999,
      originalPrice: 4000,
      rating: 4.5,
      ratingCount: 64,
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: "rel4",
      name: "Kanchipuram Silk Saree",
      colorTag: "Golden Mustard",
      price: 7899,
      originalPrice: 7300,
      rating: 4.8,
      ratingCount: 112,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
    },
    {
      id: "rel5",
      name: "Banarasi Silk Saree",
      colorTag: "Royal Blue",
      price: 6899,
      originalPrice: 6000,
      rating: 4.6,
      ratingCount: 83,
      image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: "rel6",
      name: "Tissue Silk Saree",
      colorTag: "Pastel Peach",
      price: 5499,
      originalPrice: 5400,
      rating: 4.5,
      ratingCount: 59,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
    }
  ],
  recentlyViewed: [
    {
      id: "rv1",
      name: "Kanchipuram Pure Silk Saree",
      price: 6999,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
    },
    {
      id: "rv2",
      name: "Banarasi Silk Saree Pink",
      price: 6499,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
    },
    {
      id: "rv3",
      name: "Soft Silk Saree Green",
      price: 4999,
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: "rv4",
      name: "Tissue Silk Saree Peach",
      price: 5499,
      image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
    },
    {
      id: "rv5",
      name: "Organza Silk Saree Lavender",
      price: 4299,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=500&auto=format&fit=crop"
    }
  ]
};

// 11. Helper to retrieve a product by ID dynamically
export const getProductById = (id) => {
  if (!id) return null;

  // Exact match for sample detail
  if (id === SAMPLE_PRODUCT_DETAIL.id || id === 'kanchipuram-pure-silk') {
    return SAMPLE_PRODUCT_DETAIL;
  }

  // Check in main PRODUCTS catalog
  const foundInProducts = PRODUCTS.find((p) => String(p.id) === String(id));
  if (foundInProducts) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      ...foundInProducts,
      id: foundInProducts.id,
      name: foundInProducts.name,
      price: foundInProducts.price,
      originalPrice: foundInProducts.originalPrice || Math.round(foundInProducts.price * 1.3),
      fabric: foundInProducts.fabric || "Pure Silk",
      discountBadge: foundInProducts.discountBadge || "EXCLUSIVE",
      rating: foundInProducts.rating || 4.8,
      ratingCount: foundInProducts.ratingCount || 42,
      inStock: foundInProducts.inStock !== false,
      stockCount: foundInProducts.stockCount || 8,
      image: foundInProducts.image,
      images: [
        foundInProducts.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
        "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
      ]
    };
  }

  // Check in relatedProducts
  const foundInRelated = SAMPLE_PRODUCT_DETAIL.relatedProducts.find((p) => String(p.id) === String(id));
  if (foundInRelated) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      id: foundInRelated.id,
      name: foundInRelated.name,
      price: foundInRelated.price,
      originalPrice: foundInRelated.originalPrice || Math.round(foundInRelated.price * 1.2),
      rating: foundInRelated.rating || 4.6,
      ratingCount: foundInRelated.ratingCount || 50,
      image: foundInRelated.image,
      images: [
        foundInRelated.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
      ]
    };
  }

  // Check in recentlyViewed
  const foundInRecent = SAMPLE_PRODUCT_DETAIL.recentlyViewed.find((p) => String(p.id) === String(id));
  if (foundInRecent) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      id: foundInRecent.id,
      name: foundInRecent.name,
      price: foundInRecent.price,
      image: foundInRecent.image,
      images: [
        foundInRecent.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
      ]
    };
  }

  // Check in MOCK_WISHLIST_ITEMS
  const foundInWishlist = MOCK_WISHLIST_ITEMS.find((p) => String(p.id) === String(id));
  if (foundInWishlist) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      ...foundInWishlist,
      id: foundInWishlist.id,
      name: foundInWishlist.name,
      price: foundInWishlist.price,
      originalPrice: foundInWishlist.originalPrice,
      fabric: foundInWishlist.fabric,
      rating: foundInWishlist.rating,
      ratingCount: foundInWishlist.ratingCount,
      image: foundInWishlist.image,
      images: [
        foundInWishlist.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
      ]
    };
  }

  // Check in MOCK_CART_ITEMS
  const foundInCart = MOCK_CART_ITEMS.find((p) => String(p.id) === String(id) || String(p.productId) === String(id));
  if (foundInCart) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      ...foundInCart,
      id: foundInCart.id,
      name: foundInCart.name,
      price: foundInCart.price,
      originalPrice: foundInCart.originalPrice,
      fabric: foundInCart.fabric,
      image: foundInCart.image,
      images: [
        foundInCart.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg",
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
      ]
    };
  }

  // Check in RECOMMENDED_PRODUCTS
  const foundInRec = RECOMMENDED_PRODUCTS.find((p) => String(p.id) === String(id));
  if (foundInRec) {
    return {
      ...SAMPLE_PRODUCT_DETAIL,
      ...foundInRec,
      id: foundInRec.id,
      name: foundInRec.name,
      price: foundInRec.price,
      originalPrice: foundInRec.originalPrice,
      image: foundInRec.image,
      images: [
        foundInRec.image,
        "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
      ]
    };
  }

  // Return null if invalid ID
  return null;
};

// 12. Mock Wishlist Items Array
export const MOCK_WISHLIST_ITEMS = [
  {
    id: "w1",
    name: "Kanchipuram Pure Silk Saree",
    fabric: "Kanchipuram Silk",
    width: "48 Inches",
    height: "6.2 Meters",
    blouseIncluded: true,
    price: 6999,
    originalPrice: 8999,
    discountBadge: "22% OFF",
    rating: 4.8,
    ratingCount: 248,
    inStock: true,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
  },
  {
    id: "w2",
    name: "Banarasi Silk Saree",
    fabric: "Banarasi Silk",
    width: "46 Inches",
    height: "6.3 Meters",
    blouseIncluded: true,
    price: 5499,
    originalPrice: 6999,
    badgeType: "new",
    discountBadge: "NEW ARRIVAL",
    rating: 4.7,
    ratingCount: 167,
    inStock: true,
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "w3",
    name: "Organza Silk Saree",
    fabric: "Organza Silk",
    width: "46 Inches",
    height: "6.0 Meters",
    blouseIncluded: true,
    price: 4299,
    originalPrice: 5299,
    badgeType: "bestseller",
    discountBadge: "BEST SELLER",
    rating: 4.6,
    ratingCount: 134,
    inStock: true,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
  },
  {
    id: "w4",
    name: "Soft Silk Saree",
    fabric: "Soft Silk",
    width: "48 Inches",
    height: "6.1 Meters",
    blouseIncluded: true,
    price: 3699,
    originalPrice: 4499,
    discountBadge: "18% OFF",
    rating: 4.7,
    ratingCount: 98,
    inStock: true,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "w5",
    name: "Tissue Silk Saree",
    fabric: "Tissue Silk",
    width: "46 Inches",
    height: "6.3 Meters",
    blouseIncluded: true,
    price: 4999,
    originalPrice: 5899,
    discountBadge: "15% OFF",
    rating: 4.6,
    ratingCount: 76,
    inStock: true,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
  },
  {
    id: "w6",
    name: "Georgette Saree",
    fabric: "Georgette",
    width: "46 Inches",
    height: "6.0 Meters",
    blouseIncluded: true,
    price: 2799,
    originalPrice: 3499,
    discountBadge: "20% OFF",
    rating: 4.5,
    ratingCount: 63,
    inStock: true,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "w7",
    name: "Pattu Silk Saree",
    fabric: "Pattu Silk",
    width: "48 Inches",
    height: "6.2 Meters",
    blouseIncluded: true,
    price: 7699,
    originalPrice: 10999,
    discountBadge: "30% OFF",
    rating: 4.8,
    ratingCount: 112,
    inStock: true,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "w8",
    name: "Linen Silk Saree",
    fabric: "Linen Silk",
    width: "47 Inches",
    height: "6.1 Meters",
    blouseIncluded: true,
    price: 3299,
    originalPrice: 3999,
    badgeType: "new",
    discountBadge: "NEW ARRIVAL",
    rating: 4.4,
    ratingCount: 52,
    inStock: true,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
  }
];

// 13. Mock Cart Items Array (Matching Reference Screenshot)
export const MOCK_CART_ITEMS = [
  {
    id: "c1",
    productId: "kanchipuram-pure-silk",
    name: "Kanchipuram Pure Silk Saree",
    fabric: "Kanchipuram Silk",
    color: "Magenta",
    blouseIncluded: true,
    blouseSize: "0.8 Meter",
    width: "48 Inches",
    height: "6.2 Meters",
    pattern: "Traditional Zari",
    price: 6999,
    originalPrice: 8999,
    discountBadge: "22% OFF",
    rating: 4.8,
    ratingCount: 248,
    quantity: 1,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
  },
  {
    id: "c2",
    productId: "p2",
    name: "Banarasi Silk Saree",
    fabric: "Banarasi Silk",
    color: "Emerald Green",
    blouseIncluded: true,
    blouseSize: "0.8 Meter",
    width: "46 Inches",
    height: "6.3 Meters",
    pattern: "Golden Brocade",
    price: 5499,
    originalPrice: 6999,
    discountBadge: "15% OFF",
    rating: 4.7,
    ratingCount: 167,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "c3",
    productId: "w3",
    name: "Organza Silk Saree",
    fabric: "Organza Silk",
    color: "Lavender",
    blouseIncluded: true,
    blouseSize: "0.8 Meter",
    width: "46 Inches",
    height: "6.0 Meters",
    pattern: "Floral Woven",
    price: 4299,
    originalPrice: 5299,
    badgeType: "new",
    discountBadge: "NEW",
    rating: 4.6,
    ratingCount: 134,
    quantity: 1,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
  }
];

// 14. Available Offers Array
export const AVAILABLE_OFFERS = [
  {
    id: "o1",
    code: "FESTIVE10",
    badge: "Best Offer",
    title: "Get 10% OFF on orders above ₹5,000",
    discountPercent: 10,
    isApplied: false
  },
  {
    id: "o2",
    code: "HSFS500",
    badge: "",
    title: "Flat ₹500 OFF on your first order",
    discountAmount: 500,
    isApplied: false
  },
  {
    id: "o3",
    code: "FREESHIP",
    badge: "",
    title: "Free shipping on orders above ₹999",
    isApplied: true
  }
];

// 15. You May Also Like Recommended Products Array
export const RECOMMENDED_PRODUCTS = [
  {
    id: "rec1",
    name: "Tissue Silk Saree",
    price: 4999,
    originalPrice: 5899,
    discountBadge: "15% OFF",
    rating: 4.6,
    ratingCount: 76,
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg"
  },
  {
    id: "rec2",
    name: "Pattu Silk Saree",
    price: 7899,
    originalPrice: 10999,
    discountBadge: "30% OFF",
    rating: 4.8,
    ratingCount: 112,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "rec3",
    name: "Soft Silk Saree",
    price: 3699,
    originalPrice: 4499,
    discountBadge: "18% OFF",
    rating: 4.7,
    ratingCount: 98,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "rec4",
    name: "Georgette Saree",
    price: 2799,
    originalPrice: 3499,
    discountBadge: "20% OFF",
    rating: 4.5,
    ratingCount: 63,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
  }
];

export const MOCK_ADDRESSES = [
  {
    id: "addr1",
    label: "Home",
    isDefault: true,
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    email: "ananya.sharma@example.com",
    house: "123, Anna Nagar 2nd Street",
    street: "Bodinayakanur",
    landmark: "Near Lotus Park",
    city: "Theni",
    state: "Tamil Nadu",
    pincode: "625513"
  },
  {
    id: "addr2",
    label: "Office",
    isDefault: false,
    name: "Ananya Sharma",
    phone: "+91 98765 43210",
    email: "ananya.work@example.com",
    house: "Suite 402, Signature Towers",
    street: "MG Road",
    landmark: "Opp. City Mall",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001"
  }
];

export const DELIVERY_METHODS = [
  {
    id: "del_standard",
    name: "Standard Delivery",
    estimate: "Delivery in 4 - 6 business days",
    price: 0,
    badge: "FREE"
  },
  {
    id: "del_express",
    name: "Express Premium Delivery",
    estimate: "Guaranteed delivery in 1 - 2 business days",
    price: 199,
    badge: "EXPRESS"
  },
  {
    id: "del_pickup",
    name: "Boutique Pickup",
    estimate: "Collect from your nearest Happy Sarees showroom",
    price: 0,
    badge: "STORE PICKUP"
  }
];

export const PAYMENT_METHODS = [
  {
    id: "pay_upi",
    name: "UPI / Google Pay / PhonePe / Paytm",
    desc: "Instant payment via BHIM UPI, GPay, PhonePe, or Paytm QR",
    icons: ["GPay", "PhonePe", "Paytm"]
  },
  {
    id: "pay_card",
    name: "Credit / Debit Card",
    desc: "Safe & encrypted payments via Visa, MasterCard, RuPay",
    icons: ["VISA", "MasterCard", "RuPay"]
  },
  {
    id: "pay_netbanking",
    name: "Net Banking",
    desc: "Direct payment from SBI, HDFC, ICICI, Axis & 50+ banks",
    icons: ["NetBanking"]
  },
  {
    id: "pay_cod",
    name: "Cash on Delivery (COD)",
    desc: "Pay in cash or UPI when your saree arrives at your doorstep",
    charge: 40,
    icons: ["COD"]
  },
  {
    id: "pay_wallet",
    name: "Wallets",
    desc: "Amazon Pay, Mobikwik, Reliance Pay & more",
    icons: ["Wallets"]
  }
];

export const MOCK_USER_PROFILE = {
  name: "Sumathi",
  email: "sumathi@example.com",
  phone: "+91 98765 43210",
  gender: "Female",
  dob: "1992-08-15",
  memberTier: "Premium Member",
  rewardPoints: 1520,
  pendingOrdersCount: 3,
  deliveredOrdersCount: 18,
  wishlistCount: 12,
  addressCount: 2,
  totalOrders: 21,
  totalSpent: 45296,
  totalSaved: 6250,
  memberSince: "May 2024",
  avatar: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
};

export const MOCK_ACCOUNT_ORDERS = [
  {
    id: "HS123456",
    date: "12 May, 2024",
    totalPrice: 6999,
    itemCount: 1,
    status: "Processing",
    statusColor: "orange",
    items: [
      {
        id: "kanchipuram-pure-silk",
        name: "Kanchipuram Pure Silk Saree",
        fabric: "Kanchipuram Silk",
        color: "Magenta",
        price: 6999,
        quantity: 1,
        image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
      }
    ]
  },
  {
    id: "HS123455",
    date: "10 May, 2024",
    totalPrice: 10998,
    itemCount: 2,
    status: "Shipped",
    statusColor: "blue",
    items: [
      {
        id: "p2",
        name: "Banarasi Silk Saree",
        fabric: "Banarasi Silk",
        color: "Emerald Green",
        price: 5499,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  {
    id: "HS123454",
    date: "05 May, 2024",
    totalPrice: 4299,
    itemCount: 1,
    status: "Delivered",
    statusColor: "green",
    items: [
      {
        id: "w3",
        name: "Organza Silk Saree",
        fabric: "Organza Silk",
        color: "Lavender",
        price: 4299,
        quantity: 1,
        image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
      }
    ]
  }
];

export const MOCK_USER_REVIEWS = [
  {
    id: "rev1",
    productName: "Kanchipuram Pure Silk Saree",
    rating: 5,
    date: "14 May, 2024",
    title: "Breathtaking quality & vibrant zari work!",
    comment: "The saree arrived in pristine luxury packaging. The silk texture is super rich and authentic. Highly recommended for weddings!",
    image: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
  },
  {
    id: "rev2",
    productName: "Banarasi Silk Saree",
    rating: 5,
    date: "02 April, 2024",
    title: "Royal look for festive occasions",
    comment: "The woven golden brocade is so intricate. Everyone complimented me at the family function.",
    image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif1",
    title: "Order Shipped! 🚚",
    message: "Your order #HS123455 has been handed over to BlueDart courier.",
    time: "2 hours ago",
    unread: true
  },
  {
    id: "notif2",
    title: "Exclusive Reward Points Added 🎁",
    message: "You earned 250 bonus points on your recent purchase!",
    time: "1 day ago",
    unread: true
  },
  {
    id: "notif3",
    title: "Festive Sale Alert 🎉",
    message: "Flat 25% OFF on Kanchipuram Silk Sarees for VIP members.",
    time: "3 days ago",
    unread: false
  }
];

export const MOCK_BRAND_VALUES = [
  {
    icon: "✨",
    title: "Authenticity",
    desc: "100% Handcrafted pure weaves curated directly from traditional master weavers across India."
  },
  {
    icon: "🌸",
    title: "Elegance",
    desc: "Timeless silhouettes tailored for modern Indian women, blending heritage with contemporary charm."
  },
  {
    icon: "🤝",
    title: "Trust",
    desc: "Silk Mark certified quality, transparent pricing, and zero compromise on fabric purity."
  },
  {
    icon: "❤️",
    title: "Customer First",
    desc: "Personalized saree styling assistance, custom blouse tailoring, and dedicated support."
  }
];

export const MOCK_WHY_HAPPY_SAREES = [
  { title: "Handpicked Collections", desc: "Curated by expert fashion stylists for royal heritage appeal." },
  { title: "Quality Checked", desc: "Every drape passes 12 rigorous quality tests before dispatch." },
  { title: "Secure Shopping", desc: "256-bit encrypted checkout with all major payment options." },
  { title: "Easy Returns", desc: "7-day hassle-free doorstep returns and quick refunds." },
  { title: "Fast Delivery", desc: "Express insured shipping across 19,000+ pincodes in India." },
  { title: "Dedicated Support", desc: "24/7 fashion consultation and order assistance via WhatsApp." }
];

export const MOCK_JOURNEY_TIMELINE = [
  {
    year: "2018",
    title: "The Vision Begins",
    desc: "Founded in Coimbatore with a passion for preserving traditional handloom saree artistry."
  },
  {
    year: "2020",
    title: "Flagship Boutique",
    desc: "Opened our first flagship silk boutique in Tamil Nadu, welcoming 10,000+ happy patrons."
  },
  {
    year: "2022",
    title: "Digital E-Commerce Launch",
    desc: "Expanded into an online boutique to deliver handcrafted sarees directly to homes nationwide."
  },
  {
    year: "2024",
    title: "Artisan Empowerment",
    desc: "Partnered with 500+ master weavers across Kanchipuram, Banaras, Chanderi, and Bengal."
  },
  {
    year: "Today",
    title: "Draping Happiness Globally",
    desc: "Serving over 100,000+ saree lovers worldwide with authentic handcrafted drape collections."
  }
];

export const MOCK_CUSTOMER_TESTIMONIALS = [
  {
    id: "t1",
    name: "Priyamvada Sharma",
    city: "Mumbai",
    rating: 5,
    quote: "The Kanchipuram silk saree I ordered for my sister's wedding was beyond gorgeous! The zari luster and softness left everyone in awe.",
    saree: "Pure Kanchipuram Silk",
    avatar: "https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg"
  },
  {
    id: "t2",
    name: "Meenakshi Sundaram",
    city: "Chennai",
    rating: 5,
    quote: "Happy Sarees is my go-to boutique. Their packaging is royal and the saree quality is 100% authentic Silk Mark certified.",
    saree: "Royal Banarasi Silk",
    avatar: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "t3",
    name: "Ananya Roy",
    city: "Kolkata",
    rating: 5,
    quote: "Exceptional customer service! They even helped me customize my blouse stitching size perfectly. Truly living up to their name!",
    saree: "Organza Floral Saree",
    avatar: "https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg"
  }
];

export const MOCK_FAQS = [
  {
    id: "faq1",
    question: "How long does delivery take?",
    answer: "Standard delivery takes 3-5 business days across India. Express delivery is available for select metro cities (1-2 business days). International orders are delivered within 5-7 business days."
  },
  {
    id: "faq2",
    question: "Can I return or exchange products?",
    answer: "Yes! We offer a 7-day hassle-free doorstep return and exchange policy. Simply initiate a return request from your My Account orders tab or contact our support team."
  },
  {
    id: "faq3",
    question: "How do I track my order?",
    answer: "Once your order is shipped, you will receive an SMS and email containing your BlueDart / Delhivery tracking number (AWB). You can also track live status under My Account > Orders."
  },
  {
    id: "faq4",
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes, Cash on Delivery is available across 19,000+ pincodes in India for orders up to ₹15,000."
  },
  {
    id: "faq5",
    question: "Are your sarees 100% authentic silk certified?",
    answer: "Absolutely! All our pure silk sarees carry official Silk Mark Certification guaranteeing 100% natural silk purity."
  }
];








