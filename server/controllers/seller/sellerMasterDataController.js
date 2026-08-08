const sellerMasterDataService = require('../../services/seller/sellerMasterDataService');

async function submitRequest(req, res, next) {
  try {
    const request = await sellerMasterDataService.submitRequest(req.seller.id, req.body);
    res.json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

async function getMyRequests(req, res, next) {
  try {
    const requests = await sellerMasterDataService.getSellerRequests(req.seller.id);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
}

const masterDataService = require('../../services/admin/masterDataService');

async function getTypes(req, res, next) {
  try {
    const types = await masterDataService.getAllTypes();
    res.json({ success: true, types });
  } catch (err) {
    next(err);
  }
}

async function getItems(req, res, next) {
  try {
    const items = await masterDataService.getAllItems();
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitRequest, getMyRequests, getTypes, getItems };
