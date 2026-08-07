const sellerMasterDataService = require('../../services/seller/sellerMasterDataService');

async function getAllRequests(req, res, next) {
  try {
    const { status = 'all' } = req.query;
    const requests = await sellerMasterDataService.getAllRequests(status);
    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
}

async function approveRequest(req, res, next) {
  try {
    const { id } = req.params;
    await sellerMasterDataService.approveRequest(parseInt(id), req.admin?.id || 1);
    res.json({ success: true, message: 'Request approved and item added to master data.' });
  } catch (err) {
    next(err);
  }
}

async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    await sellerMasterDataService.rejectRequest(parseInt(id), req.admin?.id || 1, adminNote);
    res.json({ success: true, message: 'Request rejected.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllRequests, approveRequest, rejectRequest };
