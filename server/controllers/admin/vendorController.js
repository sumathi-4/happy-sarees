const sellerApprovalService = require('../../services/admin/sellerApprovalService');
const db = require('../../db');

function camelCaseRow(row) {
  if (!row) return null;
  const newRow = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    if (key === 'documents' && Array.isArray(row[key])) {
      newRow[camelKey] = row[key].map(camelCaseRow);
    } else {
      newRow[camelKey] = row[key];
    }
  }
  return { ...row, ...newRow };
}

async function getSellers(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const sellers = await sellerApprovalService.listSellers(filters);
    const mapped = sellers.map(camelCaseRow);
    res.json({ success: true, sellers: mapped, requests: mapped });
  } catch (err) {
    next(err);
  }
}

async function getSellerById(req, res, next) {
  try {
    const seller = await sellerApprovalService.getSellerDetailsForAdmin(req.params.id);
    res.json({ success: true, seller: camelCaseRow(seller) });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
}

async function approve(req, res, next) {
  try {
    const sellerId = req.params.id;
    const adminUserId = req.adminUser ? req.adminUser.adminId : 1; // Fallback to super admin if mock session
    await sellerApprovalService.approveSeller(sellerId, adminUserId);
    res.json({ success: true, message: 'Seller application approved successfully.' });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const sellerId = req.params.id;
    const { reason, adminNotes } = req.body;

    if (!reason || !adminNotes) {
      return res.status(400).json({
        success: false,
        message: 'Both rejection reason and internal admin notes are required.'
      });
    }

    await sellerApprovalService.rejectSeller(sellerId, reason, adminNotes);
    res.json({ success: true, message: 'Seller application rejected.' });
  } catch (err) {
    next(err);
  }
}

async function suspend(req, res, next) {
  try {
    const sellerId = req.params.id;
    await sellerApprovalService.suspendSeller(sellerId);
    res.json({ success: true, message: 'Seller account suspended.' });
  } catch (err) {
    next(err);
  }
}

async function reactivate(req, res, next) {
  try {
    const sellerId = req.params.id;
    const adminUserId = req.adminUser ? req.adminUser.adminId : 1;
    await sellerApprovalService.approveSeller(sellerId, adminUserId);
    res.json({ success: true, message: 'Seller account reactivated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function getSellerProducts(req, res, next) {
  try {
    const sellerId = req.params.id;
    const productsRes = await db.query(
      `SELECT id, name, sku, price, stock_count, approval_status 
       FROM products 
       WHERE seller_id = $1 
       ORDER BY created_at DESC`,
      [sellerId]
    );
    res.json({ success: true, products: productsRes.rows });
  } catch (err) {
    next(err);
  }
}

async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.params.id;
    const ordersRes = await db.query(
      `SELECT DISTINCT o.id, o.order_number, o.total_amount, o.order_status, o.created_at
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE oi.seller_id = $1
       ORDER BY o.created_at DESC`,
      [sellerId]
    );
    res.json({ success: true, orders: ordersRes.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSellers,
  getSellerById,
  approve,
  reject,
  suspend,
  reactivate,
  getSellerProducts,
  getSellerOrders
};
