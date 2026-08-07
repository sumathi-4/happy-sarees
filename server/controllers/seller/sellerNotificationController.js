const sellerNotificationService = require('../../services/seller/sellerNotificationService');

async function getNotifications(req, res, next) {
  try {
    const notifications = await sellerNotificationService.getSellerNotifications(req.seller.id);
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    await sellerNotificationService.markNotificationRead(req.seller.id, req.params.id);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function markAllRead(req, res, next) {
  try {
    await sellerNotificationService.markAllNotificationsRead(req.seller.id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};
