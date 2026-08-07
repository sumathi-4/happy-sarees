const sellerService = require('../../services/seller/sellerService');
const { uploadToCloudinary } = require('../../services/cloudinaryService');

function camelCaseProfile(profile) {
  if (!profile) return null;
  const newProfile = {};
  for (const key of Object.keys(profile)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (key === 'documents' && Array.isArray(profile[key])) {
      newProfile[camelKey] = profile[key].map(camelCaseProfile);
    } else {
      newProfile[camelKey] = profile[key];
    }
  }
  return { ...profile, ...newProfile };
}

async function getProfile(req, res, next) {
  try {
    const profile = await sellerService.getSellerProfile(req.seller.id);
    res.json({ success: true, profile: camelCaseProfile(profile) });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      businessName,
      storeName,
      ownerName,
      phone,
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

    // Handle Cloudinary upload for documents if base64
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

    const profile = await sellerService.updateSellerProfile(req.seller.id, {
      businessName,
      storeName,
      ownerName,
      phone,
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

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: camelCaseProfile(profile)
    });
  } catch (err) {
    next(err);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    await sellerService.updateSellerPassword(req.seller.id, currentPassword, newPassword);
    res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword
};
