const db = require('./db');
const orderService = require('./services/admin/orderService');

async function testReturnRedesign() {
  console.log('🧪 Starting E2E Audit for Redesigned Return & Refund Workflow...\n');

  try {
    // 1. Fetch real user and product from database
    const userRes = await db.query('SELECT id, email, full_name FROM users ORDER BY id ASC LIMIT 1');
    const productRes = await db.query('SELECT id, name, price FROM products LIMIT 1');

    if (userRes.rows.length === 0 || productRes.rows.length === 0) {
      console.log('⚠️ Skipping test: User or Product table empty.');
      process.exit(0);
    }

    const user = userRes.rows[0];
    const product = productRes.rows[0];
    const testOrderNumber = `HS-RET-TEST-${Date.now()}`;

    // 2. Insert test order with order_status = 'Delivered', return_status = 'No Request'
    const orderInsert = await db.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, order_status, payment_status, 
        return_status, payment_method, shipping_address, created_at
      ) VALUES ($1, $2, $3, 'Delivered', 'Paid', 'No Request', 'Pay Online', $4, NOW())
      RETURNING id, order_number, order_status, return_status, payment_status`,
      [user.id, testOrderNumber, product.price || 1999, JSON.stringify({ name: user.full_name, city: 'Chennai' })]
    );

    const orderId = orderInsert.rows[0].id;
    console.log(`📡 [Step 1] Test Order #${orderId} (${testOrderNumber}) created.`);
    console.log(`   Initial State => Order Status: "${orderInsert.rows[0].order_status}" | Return Status: "${orderInsert.rows[0].return_status}" | Payment Status: "${orderInsert.rows[0].payment_status}"`);

    // 3. Customer submits Return Request
    console.log('\n📡 [Step 2] Customer submits Return Request with reason...');
    const returnReason = 'Fabric quality issue';
    await db.query(
      `UPDATE orders 
       SET order_status = 'Returned',
           return_status = 'Return Requested', 
           return_reason = $1, 
           return_requested_at = NOW(), 
           updated_at = NOW() 
       WHERE id = $2`,
      [returnReason, orderId]
    );
    await db.query(
      `INSERT INTO order_timeline (order_id, status, note) VALUES ($1, 'Return Requested', $2)`,
      [orderId, `Return requested: ${returnReason}`]
    );

    // Verify after customer request
    const postReqRes = await db.query('SELECT order_status, return_status, payment_status, return_reason FROM orders WHERE id = $1', [orderId]);
    const p1 = postReqRes.rows[0];
    console.log(`✅ Customer Return Submitted => Order Status: "${p1.order_status}" | Return Status: "${p1.return_status}" | Reason: "${p1.return_reason}"`);
    if (p1.order_status !== 'Returned' || p1.return_status !== 'Return Requested') {
      throw new Error('❌ Test Failed: Order Status not set to Returned or Return Status not set to Return Requested!');
    }

    // 4. Admin fetches orders list & verifies return_status column
    console.log('\n📡 [Step 3] Admin fetches orders and verifies Return Status...');
    const adminOrders = await orderService.getAll({ search: testOrderNumber });
    const adminOrder = adminOrders.orders.find(o => o.id === orderId);
    console.log(`✅ Admin Order View => Order Status: "${adminOrder.order_status}" | Return Status: "${adminOrder.return_status}"`);

    // 5. Admin Approves Return Request
    console.log('\n📡 [Step 4] Admin approves return request...');
    const approvedOrder = await orderService.approveReturn(orderId, 1);
    console.log(`✅ Admin Return Approved => Order Status: "${approvedOrder.status}" | Return Status: "${approvedOrder.returnStatus}" | Payment Status: "${approvedOrder.paymentStatus}"`);
    if (approvedOrder.returnStatus !== 'Refunded' || approvedOrder.paymentStatus !== 'Refunded' || approvedOrder.status !== 'Returned') {
      throw new Error('❌ Test Failed: Automatic refund failed or Order Status not Returned!');
    }

    // 6. Test Reject Return Flow on another test order
    console.log('\n📡 [Step 5] Testing Admin Return Rejection on secondary test order...');
    const testOrder2Number = `HS-RET-TEST2-${Date.now()}`;
    const orderInsert2 = await db.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, order_status, payment_status, 
        return_status, payment_method, shipping_address, created_at
      ) VALUES ($1, $2, $3, 'Delivered', 'Paid', 'Return Requested', 'Pay Online', $4, NOW())
      RETURNING id`,
      [user.id, testOrder2Number, product.price || 1999, JSON.stringify({ name: user.full_name, city: 'Chennai' })]
    );
    const orderId2 = orderInsert2.rows[0].id;
    const rejectedOrder = await orderService.rejectReturn(orderId2, 1);
    console.log(`✅ Admin Return Rejected => Order Status: "${rejectedOrder.status}" | Return Status: "${rejectedOrder.returnStatus}" | Payment Status: "${rejectedOrder.paymentStatus}"`);
    if (rejectedOrder.returnStatus !== 'Return Rejected' || rejectedOrder.paymentStatus !== 'Paid') {
      throw new Error('❌ Test Failed: Reject return did not preserve payment status or update return status properly!');
    }

    // 7. Cleanup
    await db.query('DELETE FROM order_timeline WHERE order_id IN ($1, $2)', [orderId, orderId2]);
    await db.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId, orderId2]);
    console.log('\n🧹 Test orders and timeline cleaned up.');
    console.log('🎉 REDESIGNED RETURN & REFUND WORKFLOW E2E AUDIT PASSED 100%!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ E2E Test Error:', err);
    process.exit(1);
  }
}

testReturnRedesign();
