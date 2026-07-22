// ============================================================
//  orderService.js — Admin Order Management
// ============================================================

const db = require('../../db');
const { parsePagination, buildOrderBy } = require('../../utils/pagination');

const VALID_STATUSES = ['Processing','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled','Returned','Refunded'];

class OrderService {

  // ── List Orders ────────────────────────────────────────────
  async getAll(query) {
    const { page, limit, offset } = parsePagination(query, 15);
    const { search, status, paymentStatus, dateFrom, dateTo, sort } = query;

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
    const [data, countRes] = await Promise.all([
      db.query(
        `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM orders o LEFT JOIN users u ON o.user_id = u.id
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT $${params.length-1} OFFSET $${params.length}`,
        params
      ),
      db.query(`SELECT COUNT(*) FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE ${whereClause}`, params.slice(0,-2)),
    ]);

    return {
      orders: data.rows.map(r => ({
        id:            r.id,
        orderNumber:   r.order_number,
        amount:        Number(r.total_amount),
        status:        r.order_status,
        paymentStatus: r.payment_status,
        paymentMethod: r.payment_method,
        customer:      r.customer_name || 'Guest',
        email:         r.customer_email,
        phone:         r.customer_phone,
        trackingNumber:r.tracking_number,
        refundStatus:  r.refund_status,
        shippingAddress: r.shipping_address,
        date:          r.created_at,
      })),
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

    const updates = { order_status: status, updated_at: 'NOW()' };
    if (status === 'Cancelled') updates.cancelled_at = 'NOW()';

    await db.query(
      `UPDATE orders SET order_status = $1, updated_at = NOW() ${status === 'Cancelled' ? ', cancelled_at = NOW()' : ''} WHERE id = $2`,
      [status, id]
    );

    // Log to timeline
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note, created_by) VALUES ($1,$2,$3,$4)`,
      [id, status, note || null, adminUserId || null]
    );

    return this.getById(id);
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
    return this.getById(id);
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
}

module.exports = new OrderService();
