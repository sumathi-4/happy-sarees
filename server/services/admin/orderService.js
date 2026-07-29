// ============================================================
//  orderService.js — Admin Order Management
// ============================================================

const db = require('../../db');
const { parsePagination, buildOrderBy } = require('../../utils/pagination');
const emailService = require('../emailService');

const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out For Delivery',
  'Delivered',
  'Cancelled',
  'Returned'
];

const VALID_RETURN_STATUSES = [
  'No Request',
  'Return Requested',
  'Return Approved',
  'Return Rejected',
  'Refunded'
];

class OrderService {

  // ── List Orders ────────────────────────────────────────────
  async getAll(query) {
    const { page, limit, offset } = parsePagination(query, 15);
    const { search, status, returnStatus, paymentStatus, dateFrom, dateTo, sort } = query;

    let where = [`1=1`];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(o.order_number ILIKE $${params.length} OR u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      where.push(`o.order_status = $${params.length}`);
    }
    if (returnStatus) {
      params.push(returnStatus);
      where.push(`o.return_status = $${params.length}`);
    }
    if (paymentStatus) {
      params.push(paymentStatus);
      where.push(`o.payment_status = $${params.length}`);
    }
    if (dateFrom) {
      params.push(dateFrom);
      where.push(`DATE(o.created_at) >= $${params.length}`);
    }
    if (dateTo) {
      params.push(dateTo);
      where.push(`DATE(o.created_at) <= $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const orderBy = buildOrderBy(sort, ['total_amount','created_at','order_status'], 'o.created_at DESC');

    params.push(limit, offset);
    const [data, countRes, timelineRes, itemsRes] = await Promise.all([
      db.query(
        `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o LEFT JOIN users u ON o.user_id = u.id
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE ${whereClause}`, params.slice(0,-2)),
      db.query(`SELECT ot.*, au.name as created_by_name FROM order_timeline ot LEFT JOIN admin_users au ON ot.created_by = au.id ORDER BY ot.created_at ASC`),
      db.query(`SELECT oi.*, p.name as product_name, p.sku, p.fabric,
                       COALESCE(pi.image_data, pi.image_url, '/src/assets/hero_saree_model.png') as image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true`)
    ]);

    const timelineMap = {};
    (timelineRes.rows || []).forEach(t => {
      if (!timelineMap[t.order_id]) timelineMap[t.order_id] = [];
      const timeStr = t.created_at ? new Date(t.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';
      timelineMap[t.order_id].push({
        status: t.status,
        note: t.note,
        time: timeStr,
        completed: true,
        createdBy: t.created_by_name || 'System',
        date: t.created_at
      });
    });

    const itemsMap = {};
    (itemsRes.rows || []).forEach(i => {
      if (!itemsMap[i.order_id]) itemsMap[i.order_id] = [];
      itemsMap[i.order_id].push({
        id: i.id,
        productId: i.product_id,
        productName: i.product_name || 'Silk Saree',
        name: i.product_name || 'Silk Saree',
        sku: i.sku || 'HS-001',
        fabric: i.fabric || 'Silk',
        quantity: i.quantity,
        qty: i.quantity,
        price: Number(i.price_at_purchase),
        total: Number(i.price_at_purchase) * i.quantity,
        image: i.image
      });
    });

    return {
      orders: data.rows.map(r => {
        let addr = r.shipping_address;
        if (typeof addr === 'string') {
          try { addr = JSON.parse(addr); } catch(e) {}
        }
        let addrStr = '';
        if (addr && typeof addr === 'object') {
          addrStr = `${addr.name || r.customer_name || ''} (${addr.label || 'Address'}), ${addr.house ? addr.house + ', ' : ''}${addr.street || ''}, ${addr.city || ''}, ${addr.state || 'Tamil Nadu'} - ${addr.pincode || ''}, Phone: ${addr.phone || r.customer_phone || ''}`.trim();
        } else {
          addrStr = String(addr || 'Address registered on checkout');
        }

        const realTimeline = timelineMap[r.id] && timelineMap[r.id].length > 0
          ? timelineMap[r.id]
          : [
              { status: 'Order Placed', time: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'System', completed: true },
              { status: r.order_status || 'Confirmed', time: 'Updated', completed: true }
            ];

        const realItems = itemsMap[r.id] || [];

        return {
          id: r.id,
          orderNumber: r.order_number || `HS-ORD-${r.id}`,
          order_number: r.order_number || `HS-ORD-${r.id}`,
          amount: Number(r.total_amount || 0),
          totalAmount: Number(r.total_amount || 0),
          total_amount: Number(r.total_amount || 0),
          status: r.order_status || 'Confirmed',
          orderStatus: r.order_status || 'Confirmed',
          order_status: r.order_status || 'Confirmed',
          paymentStatus: r.payment_status || 'Pending',
          payment_status: r.payment_status || 'Pending',
          returnStatus: r.return_status || 'No Request',
          return_status: r.return_status || 'No Request',
          returnReason: r.return_reason || '',
          return_reason: r.return_reason || '',
          returnRequestedAt: r.return_requested_at || null,
          return_requested_at: r.return_requested_at || null,
          paymentMethod: r.payment_method || 'Pay Online',
          payment_method: r.payment_method || 'Pay Online',
          deliveryStatus: r.delivery_status || r.order_status || 'Processing',
          delivery_status: r.delivery_status || r.order_status || 'Processing',
          customer: r.customer_name || (addr && addr.name) || 'Guest',
          customerName: r.customer_name || (addr && addr.name) || 'Guest',
          email: r.customer_email || '',
          customerEmail: r.customer_email || '',
          phone: r.customer_phone || (addr && addr.phone) || '',
          customerPhone: r.customer_phone || (addr && addr.phone) || '',
          trackingNumber: r.tracking_number || '',
          courierName: r.courier_name || 'Express Courier',
          refundStatus: r.refund_status,
          shippingAddress: addrStr,
          rawAddress: addr,
          adminNotes: r.admin_notes || '',
          admin_notes: r.admin_notes || '',
          timeline: realTimeline,
          items: realItems,
          products: realItems,
          date: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
          orderDate: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
          createdAt: r.created_at,
          razorpayOrderId: r.razorpay_order_id,
          razorpayPaymentId: r.razorpay_payment_id
        };
      }),
      total: Number(countRes.rows[0].count),
      page,
      limit,
    };
  }

  // ── Get Order Detail ───────────────────────────────────────
  async getById(id) {
    const [order, items, timeline] = await Promise.all([
      db.query(
        `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      ),
      db.query(
        `SELECT oi.*, p.name as product_name, p.sku,
                pi.image_url, pi.image_data
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
         WHERE oi.order_id = $1`,
        [id]
      ),
      db.query(
        `SELECT ot.*, au.name as created_by_name
         FROM order_timeline ot
         LEFT JOIN admin_users au ON ot.created_by = au.id
         WHERE ot.order_id = $1
         ORDER BY ot.created_at ASC`,
        [id]
      ),
    ]);

    if (order.rows.length === 0) throw { status: 404, message: 'Order not found.' };

    const o = order.rows[0];
    return {
      id:             o.id,
      orderNumber:    o.order_number,
      amount:         Number(o.total_amount),
      status:         o.order_status,
      paymentStatus:  o.payment_status,
      returnStatus:   o.return_status || 'No Request',
      returnReason:   o.return_reason || '',
      returnRequestedAt: o.return_requested_at || null,
      paymentMethod:  o.payment_method,
      customer:       { name: o.customer_name, email: o.customer_email, phone: o.customer_phone },
      shippingAddress: o.shipping_address,
      trackingNumber: o.tracking_number,
      trackingCarrier: o.tracking_carrier,
      refundStatus:   o.refund_status,
      refundAmount:   o.refund_amount ? Number(o.refund_amount) : null,
      adminNotes:     o.admin_notes,
      cancelledAt:    o.cancelled_at,
      date:           o.created_at,
      updatedAt:      o.updated_at,
      items: items.rows.map(i => ({
        id:             i.id,
        productId:      i.product_id,
        productName:    i.product_name,
        sku:            i.sku,
        quantity:       i.quantity,
        price:          Number(i.price_at_purchase),
        total:          Number(i.price_at_purchase) * i.quantity,
        image:          i.image_data || i.image_url,
      })),
      timeline: timeline.rows.map(t => ({
        status:    t.status,
        note:      t.note,
        createdBy: t.created_by_name || 'System',
        date:      t.created_at,
      })),
    };
  }

  // ── Update Status ──────────────────────────────────────────
  async updateStatus(id, status, note, adminUserId) {
    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` };
    }

    const oldRes = await db.query('SELECT order_status FROM orders WHERE id = $1', [id]);
    const oldStatus = oldRes.rows[0]?.order_status;

    const isRefunded = status === 'Refunded';
    const isCancelled = status === 'Cancelled';
    if (status === 'Refunded') {
      await db.query(
        `UPDATE orders 
         SET order_status = $1, 
             payment_status = 'Refunded', 
             updated_at = NOW() 
             ${isCancelled ? ', cancelled_at = NOW()' : ''} 
         WHERE id = $2`,
        [status, id]
      );
    } else {
      await db.query(
        `UPDATE orders 
         SET order_status = $1, 
             updated_at = NOW() 
             ${isCancelled ? ', cancelled_at = NOW()' : ''} 
         WHERE id = $2`,
        [status, id]
      );
    }

    // Log automatically to timeline
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1,$2,$3,$4)`,
      [id, status, note || `Status updated to ${status}`, adminUserId || null]
    );

    const updatedOrder = await this.getById(id);

    // Send email ONLY if status actually changed to prevent duplicate emails
    if (oldStatus !== status) {
      const typeMap = {
        'Packed': 'PACKED',
        'Shipped': 'SHIPPED',
        'Out For Delivery': 'OUT_FOR_DELIVERY',
        'Delivered': 'DELIVERED',
        'Confirmed': 'ORDER_PLACED',
        'Refunded': 'REFUND_COMPLETED'
      };
      const emailType = typeMap[status];
      if (emailType) {
        emailService.sendNotification(emailType, updatedOrder)
          .catch(err => console.error('[Order Status Email Async Error]:', err.message));
      }
    }

    return updatedOrder;
  }

  // ── Update Tracking ────────────────────────────────────────
  async updateTracking(id, trackingNumber, carrier) {
    await db.query(
      `UPDATE orders SET tracking_number = $1, tracking_carrier = $2, updated_at = NOW() WHERE id = $3`,
      [trackingNumber, carrier, id]
    );
    return this.getById(id);
  }

  // ── Process Refund ─────────────────────────────────────────
  async processRefund(id, amount, adminUserId) {
    await db.query(
      `UPDATE orders SET refund_status = 'refunded', refund_amount = $1, payment_status = 'Refunded', updated_at = NOW() WHERE id = $2`,
      [amount, id]
    );
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1,'Refunded',$2,$3)`,
      [id, `Refund of ₹${amount} processed`, adminUserId]
    );
    const updatedOrder = await this.getById(id);
    emailService.sendNotification('REFUND_COMPLETED', updatedOrder)
      .catch(err => console.error('[Refund Email Async Error]:', err.message));
    return updatedOrder;
  }

  // ── Cancel Order ───────────────────────────────────────────
  async cancel(id, reason, adminUserId) {
    return this.updateStatus(id, 'Cancelled', reason, adminUserId);
  }

  // ── Get Invoice Data ───────────────────────────────────────
  async getInvoiceData(id) {
    const order = await this.getById(id);

    const settingsRes = await db.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'store_general'`
    );
    const storeSettings = settingsRes.rows[0]?.setting_value || {};

    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate:   new Date().toISOString(),
      store:         storeSettings,
      order,
    };
  }

  // ── Delete Order ───────────────────────────────────────────
  async delete(id) {
    await db.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);
    await db.query(`DELETE FROM order_timeline WHERE order_id = $1`, [id]);
    const res = await db.query(`DELETE FROM orders WHERE id = $1 RETURNING id`, [id]);
    if (res.rows.length === 0) {
      throw { status: 404, message: 'Order not found or already deleted.' };
    }
    return { success: true, deletedId: id };
  }

  // ── Update Staff Notes ────────────────────────────────────
  async updateNotes(id, adminNotes) {
    await db.query(
      `UPDATE orders SET admin_notes = $1, updated_at = NOW() WHERE id = $2`,
      [adminNotes, id]
    );
    return this.getById(id);
  }

  // ── Update Payment Status ──────────────────────────────────
  async updatePaymentStatus(id, paymentStatus, adminUserId) {
    await db.query(
      `UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
      [paymentStatus, id]
    );
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1, $2, $3, $4)`,
      [id, paymentStatus === 'Paid' ? 'Payment Received' : paymentStatus, `Payment status updated to ${paymentStatus}`, adminUserId || null]
    );
    return this.getById(id);
  }

  // ── Approve Return Request ──────────────────────────────────
  async approveReturn(id, adminUserId) {
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) throw { status: 404, message: 'Order not found.' };

    const order = orderRes.rows[0];

    // Automatically set order_status = 'Returned', return_status = 'Refunded' and payment_status = 'Refunded'
    await db.query(
      `UPDATE orders 
       SET order_status = 'Returned',
           return_status = 'Refunded', 
           payment_status = 'Refunded', 
           updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1, $2, $3, $4)`,
      [id, 'Return Approved', `Return request approved. Refund processed automatically (${order.payment_method || 'COD'})`, adminUserId || null]
    );

    const updatedOrder = await this.getById(id);

    // Trigger Return Approved & Refund Completed Emails Asynchronously
    emailService.sendNotification('RETURN_APPROVED', updatedOrder)
      .catch(err => console.error('[Return Approved Email Async Error]:', err.message));
    emailService.sendNotification('REFUND_COMPLETED', updatedOrder)
      .catch(err => console.error('[Refund Completed Email Async Error]:', err.message));

    return updatedOrder;
  }

  // ── Reject Return Request ───────────────────────────────────
  async rejectReturn(id, adminUserId) {
    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rows.length === 0) throw { status: 404, message: 'Order not found.' };

    await db.query(
      `UPDATE orders 
       SET order_status = 'Delivered',
           return_status = 'Return Rejected', 
           updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );

    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1, $2, $3, $4)`,
      [id, 'Return Rejected', 'Return request rejected by admin', adminUserId || null]
    );

    const updatedOrder = await this.getById(id);

    // Trigger Return Rejected Email Asynchronously
    emailService.sendNotification('RETURN_REJECTED', updatedOrder)
      .catch(err => console.error('[Return Rejected Email Async Error]:', err.message));

    return updatedOrder;
  }
}

module.exports = new OrderService();
