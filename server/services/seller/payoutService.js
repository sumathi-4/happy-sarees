const db = require('../../db');

/**
 * Calculate and generate a payout for a seller for a given date range.
 * Finds all Delivered order items with seller_id, not yet paid out.
 */
async function generatePayout(sellerId, periodStart, periodEnd) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch seller commission rate
    const sellerRes = await client.query(
      `SELECT commission_rate FROM sellers WHERE id = $1`,
      [sellerId]
    );
    if (sellerRes.rows.length === 0) throw new Error('Seller not found.');
    const commissionRate = Number(sellerRes.rows[0].commission_rate) || 10;

    // Fetch store_general settings for payout hold days and TCS rate
    const settingsRes = await client.query(
      `SELECT setting_value FROM store_settings WHERE setting_key = 'store_general'`
    );
    const storeSettingsRaw = settingsRes.rows[0]?.setting_value || {};
    let parsedSettings = {};
    if (typeof storeSettingsRaw === 'string') {
      try { parsedSettings = JSON.parse(storeSettingsRaw); } catch(e) {}
    } else {
      parsedSettings = storeSettingsRaw;
    }
    const holdDays = Number(parsedSettings.payoutHoldDays !== undefined ? parsedSettings.payoutHoldDays : 7);
    const tcsRate = Number(parsedSettings.tcsRate !== undefined ? parsedSettings.tcsRate : 1.00);

    // Find eligible order items: Delivered, in period, no existing payout line, and hold days passed
    const itemsRes = await client.query(
      `SELECT oi.id, oi.price_at_purchase, oi.quantity
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = $1
         AND oi.fulfillment_status = 'Delivered'
         AND o.created_at BETWEEN $2 AND $3
         AND COALESCE(oi.delivered_at, oi.shipped_at, o.created_at) <= NOW() - ($4 * INTERVAL '1 day')
         AND NOT EXISTS (
           SELECT 1 FROM seller_payout_items spi
           JOIN seller_payouts sp ON spi.payout_id = sp.id
           WHERE spi.order_item_id = oi.id
             AND sp.status IN ('pending','processing','paid')
         )`,
      [sellerId, periodStart, periodEnd, holdDays]
    );

    if (itemsRes.rows.length === 0) {
      throw new Error('No eligible order items found for this period after checking return hold days.');
    }

    let totalGross = 0;
    let totalCommission = 0;
    let totalTcs = 0;

    const lineItems = itemsRes.rows.map(item => {
      const gross = Number(item.price_at_purchase) * Number(item.quantity);
      const commission = parseFloat((gross * commissionRate / 100).toFixed(2));
      const tcs = parseFloat((gross * tcsRate / 100).toFixed(2));
      const net = parseFloat((gross - commission - tcs).toFixed(2));
      totalGross += gross;
      totalCommission += commission;
      totalTcs += tcs;
      return { orderItemId: item.id, gross, commission, tcs, net };
    });
    const totalNet = parseFloat((totalGross - totalCommission - totalTcs).toFixed(2));

    // Create payout record
    const payoutRes = await client.query(
      `INSERT INTO seller_payouts (seller_id, amount, status, period_start, period_end, adjustment_type, tcs_amount)
       VALUES ($1, $2, 'pending', $3, $4, 'payout', $5)
       RETURNING id`,
      [sellerId, totalNet, periodStart, periodEnd, totalTcs]
    );
    const payoutId = payoutRes.rows[0].id;

    // Insert payout line items
    for (const item of lineItems) {
      await client.query(
        `INSERT INTO seller_payout_items (payout_id, order_item_id, gross_amount, commission, net_amount, tcs_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [payoutId, item.orderItemId, item.gross, item.commission, item.net, item.tcs]
      );
    }

    // Notify seller
    await client.query(
      `INSERT INTO seller_notifications (seller_id, type, title, message)
       VALUES ($1, 'payout', 'Payout Generated', $2)`,
      [sellerId, `A payout of ₹${totalNet.toFixed(2)} (after deducting ₹${totalCommission.toFixed(2)} commission and ₹${totalTcs.toFixed(2)} TCS) has been generated for the period ${periodStart} to ${periodEnd}. Status: Pending.`]
    );

    await client.query('COMMIT');
    return { payoutId, totalGross, totalCommission, totalTcs, totalNet, itemCount: lineItems.length };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Mark a payout as paid (admin action)
 */
async function markPayoutPaid(payoutId, adminNote) {
  const res = await db.query(
    `UPDATE seller_payouts SET status = 'paid', paid_at = CURRENT_TIMESTAMP, notes = $2
     WHERE id = $1 RETURNING seller_id, amount`,
    [payoutId, adminNote || null]
  );
  if (res.rows.length === 0) throw new Error('Payout not found.');

  const { seller_id: sellerId, amount } = res.rows[0];
  await db.query(
    `INSERT INTO seller_notifications (seller_id, type, title, message)
     VALUES ($1, 'payout', 'Payout Processed', $2)`,
    [sellerId, `Your payout of ₹${Number(amount).toFixed(2)} has been processed and paid.`]
  );

  return true;
}

/**
 * List payouts for a seller
 */
async function getSellerPayouts(sellerId) {
  const res = await db.query(
    `SELECT sp.id, sp.amount, sp.status, sp.adjustment_type as "adjustmentType",
            sp.period_start as "periodStart", sp.period_end as "periodEnd",
            sp.paid_at as "paidAt", sp.notes, sp.created_at as "createdAt",
            sp.tcs_amount as "tcsAmount",
            COUNT(spi.id) as "itemCount",
            SUM(spi.gross_amount) as "grossAmount",
            SUM(spi.commission) as "commission"
     FROM seller_payouts sp
     LEFT JOIN seller_payout_items spi ON spi.payout_id = sp.id
     WHERE sp.seller_id = $1
     GROUP BY sp.id
     ORDER BY sp.created_at DESC`,
    [sellerId]
  );
  return res.rows.map(r => ({
    ...r,
    amount: Number(r.amount),
    tcsAmount: r.tcsAmount ? Number(r.tcsAmount) : 0,
    grossAmount: r.grossAmount ? Number(r.grossAmount) : null,
    commission: r.commission ? Number(r.commission) : null,
    itemCount: Number(r.itemCount)
  }));
}

/**
 * Admin: List all payouts (with seller info)
 */
async function getAllPayouts(status) {
  let query = `
    SELECT sp.id, sp.seller_id as "sellerId", sp.amount, sp.status, sp.adjustment_type as "adjustmentType",
           sp.period_start as "periodStart", sp.period_end as "periodEnd",
           sp.paid_at as "paidAt", sp.notes, sp.created_at as "createdAt",
           sp.tcs_amount as "tcsAmount",
           s.store_name as "storeName", s.email as "sellerEmail"
     FROM seller_payouts sp
     JOIN sellers s ON sp.seller_id = s.id
  `;
  if (status && status !== 'all') {
    query += ` WHERE sp.status = '${status}'`;
  }
  query += ` ORDER BY sp.created_at DESC`;
  const res = await db.query(query);
  return res.rows.map(r => ({ ...r, amount: Number(r.amount), tcsAmount: r.tcsAmount ? Number(r.tcsAmount) : 0 }));
}

/**
 * Create a return/adjustment deduction for a seller
 */
async function createAdjustment(sellerId, amount, reason) {
  const res = await db.query(
    `INSERT INTO seller_payouts (seller_id, amount, status, adjustment_type, notes)
     VALUES ($1, $2, 'paid', 'return_deduction', $3)
     RETURNING id`,
    [sellerId, -Math.abs(amount), reason || 'Return deduction']
  );
  return res.rows[0].id;
}

module.exports = {
  generatePayout,
  markPayoutPaid,
  getSellerPayouts,
  getAllPayouts,
  createAdjustment
};
