const sellerService = require('../../services/seller/sellerService');
const { generateAccessToken } = require('../../middleware/sellerAuth');
const { uploadToCloudinary } = require('../../services/cloudinaryService');

async function register(req, res, next) {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      password,
      businessCategory,
      businessDescription,
      gstin,
      panNumber,
      storeLogoUrl,
      storeBannerUrl,
      streetAddress,
      city,
      state,
      pincode,
      bankAccountName,
      bankAccountNo,
      bankIfsc,
      bankName,
      panDocument, // base64 string
      cancelledCheque // base64 string
    } = req.body;

    // Handle Cloudinary upload for documents/logos if base64 or file urls
    let storeLogo = storeLogoUrl;
    let storeBanner = storeBannerUrl;
    let panDoc = null;
    let chequeDoc = null;

    if (storeLogo && storeLogo.startsWith('data:image/')) {
      storeLogo = await uploadToCloudinary(storeLogo);
    }
    if (storeBanner && storeBanner.startsWith('data:image/')) {
      storeBanner = await uploadToCloudinary(storeBanner);
    }
    if (panDocument && panDocument.startsWith('data:')) {
      panDoc = await uploadToCloudinary(panDocument);
    }
    if (cancelledCheque && cancelledCheque.startsWith('data:')) {
      chequeDoc = await uploadToCloudinary(cancelledCheque);
    }

    const documents = [];
    if (panDoc) {
      documents.push({ doc_type: 'pan_document', file_url: panDoc });
    }
    if (chequeDoc) {
      documents.push({ doc_type: 'cancelled_cheque', file_url: chequeDoc });
    }

    const seller = await sellerService.registerSeller({
      businessName,
      ownerName,
      email,
      phone,
      password,
      businessCategory,
      businessDescription,
      gstin,
      panNumber,
      storeLogoUrl: storeLogo,
      storeBannerUrl: storeBanner,
      streetAddress,
      city,
      state,
      pincode,
      bankAccountName,
      bankAccountNo,
      bankIfsc,
      bankName,
      documents
    });

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully. Under administrative review.',
      seller
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const seller = await sellerService.authenticateSeller(email, password);

    // If approved, issue access token
    let token = null;
    if (seller.status === 'approved') {
      token = generateAccessToken(seller);
    }

    res.json({
      success: true,
      message: seller.status === 'approved' ? 'Login successful.' : `Seller account is ${seller.status}.`,
      token,
      seller: {
        ...seller,
        id: seller.id,
        businessName: seller.business_name,
        storeName: seller.store_name,
        ownerName: seller.owner_name,
        email: seller.email,
        phone: seller.phone,
        status: seller.status,
        rejectionReason: seller.rejection_reason,
        storeLogoUrl: seller.store_logo_url
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
}

async function getMe(req, res, next) {
  try {
    if (!req.seller) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    // Refresh profile details from DB
    const profile = await sellerService.getSellerProfile(req.seller.id);

    res.json({
      success: true,
      seller: {
        ...profile,
        id: profile.id,
        businessName: profile.business_name,
        storeName: profile.store_name,
        ownerName: profile.owner_name,
        email: profile.email,
        phone: profile.phone,
        status: profile.status,
        rejectionReason: profile.rejection_reason,
        storeLogoUrl: profile.store_logo_url
      }
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  res.json({
    success: true,
    message: 'Seller logged out successfully.'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
