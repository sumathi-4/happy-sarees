const emailService = require('./services/emailService');
const db = require('./db');

async function testEmailSystem() {
  console.log('🧪 Starting Centralized Email Notification System Test...\n');

  // Create a real test order in orders table
  const orderRes = await db.query(`
    INSERT INTO orders (order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
    VALUES ('HS-EMAIL-TEST-1001', 15999, 'Cash on Delivery (COD)', 'Pending', 'Confirmed', '{"name":"Test Customer","email":"sumathisrimathi4@gmail.com"}')
    RETURNING id, order_number, total_amount, payment_method, payment_status, order_status, created_at
  `);
  const dbOrder = orderRes.rows[0];

  const testOrder = {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    totalAmount: Number(dbOrder.total_amount),
    paymentMethod: dbOrder.payment_method,
    paymentStatus: dbOrder.payment_status,
    orderStatus: dbOrder.order_status,
    date: new Date(dbOrder.created_at).toLocaleDateString('en-IN'),
    customerEmail: 'sumathisrimathi4@gmail.com',
    shippingAddress: {
      name: 'Test Customer',
      house: 'Tower A',
      street: 'Silk Street',
      city: 'Kanchipuram',
      state: 'Tamil Nadu',
      pincode: '631501',
      phone: '9876543210'
    },
    items: [
      {
        id: 1,
        name: 'Royal Magenta Kanchipuram Silk Saree',
        fabric: 'Pure Silk',
        quantity: 1,
        price: 15999
      }
    ]
  };

  try {
    // 1. Dispatch ORDER_PLACED notification
    console.log(`📡 [Step 1] Dispatching ORDER_PLACED notification via Central Email Service for Order #${testOrder.id}...`);
    const res1 = await emailService.sendNotification('ORDER_PLACED', testOrder);
    console.log('Result Step 1:', res1);

    if (!res1.success) {
      throw new Error(`Email dispatch failed: ${res1.error}`);
    }

    // 2. Test Duplicate Prevention
    console.log('\n📡 [Step 2] Testing Duplicate Email Prevention (re-sending same notification)...');
    const res2 = await emailService.sendNotification('ORDER_PLACED', testOrder);
    console.log('Result Step 2:', res2);

    if (!res2.duplicateSkipped) {
      throw new Error('❌ Duplicate check failed! Email was sent twice.');
    }
    console.log('✅ Duplicate Prevention verified: Second email skipped successfully!');

    // 3. Verify Database Log Entry
    console.log('\n📡 [Step 3] Querying Neon PostgreSQL email_logs table...');
    const logsRes = await db.query(
      `SELECT * FROM email_logs WHERE order_id = $1 ORDER BY sent_at DESC`,
      [testOrder.id]
    );
    console.log(`Found ${logsRes.rows.length} log record(s) in email_logs table:`);
    console.log(JSON.stringify(logsRes.rows, null, 2));

    if (logsRes.rows.length === 0) {
      throw new Error('❌ Database logging failed! No entries found in email_logs.');
    }
    console.log('✅ Database Logging verified!');

    // Clean up test order & logs
    await db.query(`DELETE FROM email_logs WHERE order_id = $1`, [testOrder.id]);
    await db.query(`DELETE FROM orders WHERE id = $1`, [testOrder.id]);
    console.log('\n🧹 Test order and email logs cleaned up from DB.');
    console.log('🎉 CENTRALIZED EMAIL NOTIFICATION SYSTEM AUDIT PASSED 100%!');

  } catch (err) {
    console.error('❌ Email System Test Failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testEmailSystem();
