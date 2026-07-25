import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit, FiMonitor, FiTablet, FiSmartphone, 
  FiHeart, FiShoppingCart, FiStar, FiGrid, FiInfo, FiTruck, FiRefreshCw
} from 'react-icons/fi';
import { useAdminData } from '../context/AdminDataContext';
import styles from '../styles/ProductPreview.module.css';

function ProductPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products } = useAdminData();

  const [product, setProduct] = useState(null);
  const [activeViewport, setActiveViewport] = useState('desktop'); // desktop, tablet, mobile
  const [activeTab, setActiveTab] = useState('description'); // description, specs, shipping, returns
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const match = products.find(p => p.id === Number(id));
    if (match) {
      setProduct(match);
      setSelectedImage(match.image);
    } else {
      alert('Product not found.');
      navigate('/products');
    }
  }, [id, products, navigate]);

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading preview...</div>;
  }

  // Calculate discount percentage helper
  const discountPercent = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className={styles.wrapper}>
      {/* Top Device Simulator Control Bar */}
      <div className={styles.simulatorBar}>
        <button className={styles.backBtn} onClick={() => navigate(`/products/edit/${id}`)}>
          <FiArrowLeft /> Back to Edit
        </button>

        <div className={styles.viewportToggles}>
          <button 
            className={`${styles.toggleBtn} ${activeViewport === 'desktop' ? styles.toggleBtnActive : ''}`}
            onClick={() => setActiveViewport('desktop')}
            title="Desktop View"
          >
            <FiMonitor /> <span>Desktop</span>
          </button>
          <button 
            className={`${styles.toggleBtn} ${activeViewport === 'tablet' ? styles.toggleBtnActive : ''}`}
            onClick={() => setActiveViewport('tablet')}
            title="Tablet View"
          >
            <FiTablet /> <span>Tablet</span>
          </button>
          <button 
            className={`${styles.toggleBtn} ${activeViewport === 'mobile' ? styles.toggleBtnActive : ''}`}
            onClick={() => setActiveViewport('mobile')}
            title="Mobile View"
          >
            <FiSmartphone /> <span>Mobile</span>
          </button>
        </div>

        <button 
          className={styles.editBtn} 
          onClick={() => navigate(`/products/edit/${id}`)}
        >
          <FiEdit /> Edit Product
        </button>
      </div>

      {/* Viewport Frame Container */}
      <div className={`${styles.viewportFrame} ${styles[activeViewport]}`}>
        <div className={styles.storefrontHeaderMock}>
          <span>🌸 FREE SHIPPING ON PREMIUM SILK COLLECTION</span>
        </div>

        {/* Product details replica */}
        <div className={styles.productDetailContainer}>
          
          {/* Left Column: Image Gallery Grid */}
          <div className={styles.mediaColumn}>
            <div className={styles.mainImageFrame}>
              <img src={selectedImage} alt={product.name} className={styles.mainDisplayImage} />
              {product.bestSeller && <div className={styles.bestsellerTag}>Bestseller</div>}
            </div>

            <div className={styles.thumbGrid}>
              <div 
                className={`${styles.thumbFrame} ${selectedImage === product.image ? styles.thumbActive : ''}`}
                onClick={() => setSelectedImage(product.image)}
              >
                <img src={product.image} alt="Thumbnail Cover" />
              </div>
              {product.galleryImages?.map((img, idx) => (
                <div 
                  key={idx}
                  className={`${styles.thumbFrame} ${selectedImage === img ? styles.thumbActive : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`Thumb ${idx}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Saree Details & Curation */}
          <div className={styles.detailsColumn}>
            <div className={styles.categoryBreadcrumb}>
              Home / Shop / {product.fabric} / {product.name}
            </div>

            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.skuRow}>
              SKU: <code style={{ fontWeight: 'bold' }}>{product.sku}</code>
            </div>

            {/* Short Description */}
            {(product.shortDescription || product.short_description) && (
              <p style={{ fontSize: '13px', color: '#555555', marginTop: '6px', marginBottom: '10px', fontStyle: 'italic', lineHeight: '1.4' }}>
                {product.shortDescription || product.short_description}
              </p>
            )}

            {/* Review mock */}
            <div className={styles.reviewsMock}>
              <div className={styles.stars}>
                <FiStar className={styles.starFilled} />
                <FiStar className={styles.starFilled} />
                <FiStar className={styles.starFilled} />
                <FiStar className={styles.starFilled} />
                <FiStar className={styles.starHalf} />
              </div>
              <span className={styles.reviewsText}>4.8 (126 Reviews)</span>
            </div>

            {/* Price display */}
            <div className={styles.priceRow}>
              <span className={styles.sellingPrice}>₹{product.price}</span>
              {product.mrp > product.price && (
                <>
                  <span className={styles.mrpPrice}>₹{product.mrp}</span>
                  <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                </>
              )}
            </div>
            <p className={styles.taxLabel}>Inclusive of all taxes</p>

            {/* Short spec grids */}
            <div className={styles.quickSpecsGrid}>
              <div className={styles.specBox}>
                <strong>Fabric:</strong>
                <span>{product.fabric}</span>
              </div>
              <div className={styles.specBox}>
                <strong>Occasion:</strong>
                <span>{product.occasion}</span>
              </div>
              <div className={styles.specBox}>
                <strong>Color:</strong>
                <span>{product.color}</span>
              </div>
              <div className={styles.specBox}>
                <strong>Blouse:</strong>
                <span>{product.blouseIncluded ? 'Included' : 'Not Included'}</span>
              </div>
              <div className={styles.specBox}>
                <strong>Width:</strong>
                <span>{product.width}</span>
              </div>
              <div className={styles.specBox}>
                <strong>Length:</strong>
                <span>{product.height}</span>
              </div>
            </div>

            {/* Stock status indicator */}
            <div className={styles.inventoryStatusBox}>
              {product.stock > 0 ? (
                <div style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <span className={styles.inStockDot} />
                  In Stock ({product.stock} Available)
                </div>
              ) : (
                <div style={{ color: '#d32f2f', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <span className={styles.outOfStockDot} />
                  Out of Stock
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className={styles.purchaseControls}>
              <div className={styles.quantityPicker}>
                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
              </div>

              <button className={styles.addToCartBtn} onClick={() => alert('Mock Add to Cart triggered inside live preview.')}>
                <FiShoppingCart /> Add To Cart
              </button>

              <button className={styles.wishlistBtn} onClick={() => alert('Mock Add to Wishlist triggered inside live preview.')}>
                <FiHeart />
              </button>
            </div>

            {/* Tab Details Sections */}
            <div className={styles.tabsSection}>
              <div className={styles.tabHeaders}>
                <button 
                  className={`${styles.tabHeaderBtn} ${activeTab === 'description' ? styles.tabHeaderActive : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`${styles.tabHeaderBtn} ${activeTab === 'specs' ? styles.tabHeaderActive : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button 
                  className={`${styles.tabHeaderBtn} ${activeTab === 'shipping' ? styles.tabHeaderActive : ''}`}
                  onClick={() => setActiveTab('shipping')}
                >
                  Shipping
                </button>
                <button 
                  className={`${styles.tabHeaderBtn} ${activeTab === 'returns' ? styles.tabHeaderActive : ''}`}
                  onClick={() => setActiveTab('returns')}
                >
                  Returns
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeTab === 'description' && (
                  <div className={styles.tabPane}>
                    <p style={{ lineHeight: '1.6', color: '#333333' }}>
                      {product.fullDescription || product.description || product.shortDescription || product.short_description || 'No description provided.'}
                    </p>
                    <p style={{ marginTop: '12px', fontStyle: 'italic', color: '#666666', fontSize: '13px' }}>
                      * Note: Wash care: {product.washCare || product.wash_care || 'Dry Clean Only'}.
                    </p>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <div className={styles.tabPane}>
                    <table className={styles.specsTable}>
                      <tbody>
                        <tr>
                          <th>Weight</th>
                          <td>{product.weight}</td>
                        </tr>
                        <tr>
                          <th>Weave Type</th>
                          <td>{product.weave}</td>
                        </tr>
                        <tr>
                          <th>Border style</th>
                          <td>{product.border}</td>
                        </tr>
                        <tr>
                          <th>Blouse Fabric Size</th>
                          <td>{product.blouseSize || 'N/A'}</td>
                        </tr>
                        <tr>
                          <th>Wash Care</th>
                          <td>{product.washCare}</td>
                        </tr>
                        <tr>
                          <th>HSN Code</th>
                          <td>{product.hsnCode}</td>
                        </tr>
                        <tr>
                          <th>Manufacturer</th>
                          <td>{product.manufacturer}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className={styles.tabPane}>
                    <p>Free standard courier delivery across India for orders above ₹1,999.</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Estimated shipping weight:</strong> {product.weight}.
                    </p>
                    <p>
                      <strong>Shipping class:</strong> {product.shippingClass} delivery timeframe (approx 3-5 business days).
                    </p>
                  </div>
                )}
                {activeTab === 'returns' && (
                  <div className={styles.tabPane}>
                    <p>{product.returnPolicy || 'Easy 7-day returns on premium products.'}</p>
                    <p style={{ marginTop: '8px' }}>
                      <strong>Exchange policy:</strong> {product.exchangePolicy || 'Eligible within 15 days in pristine unworn condition.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductPreview;
