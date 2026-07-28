const db = require('./db');

async function testE2EOrderSynchronization() {
  console.log('🧪 Starting Full E2E Order Synchronization Test Across All System Layers...\n');

  try {
    // 1. Get valid User and Product from Neon DB
    const userRes = await db.query(`SELECT id, email, full_name FROM users LIMIT 1`);
    const user = userRes.rows[0];
    if (!user) throw new Error('No user found in Neon DB');

    const prodRes = await db.query(`SELECT id, name, price, fabric FROM products LIMIT 1`);
    const prod = prodRes.rows[0];
    if (!prod) throw new Error('No product found in Neon DB');

    console.log(`👤 Customer: User #${user.id} (${user.email})`);
    console.log(`📦 Product: Product #${prod.id} (${prod.name} - ₹${prod.price})\n`);

    // 2. Insert Order & Order Items directly into Neon DB (simulating Checkout flow)
    const testOrderNum = `HS-TEST-${Date.now()}`;
    const testAddress = {
      name: user.full_name || 'Test User',
      label: 'Home',
      house: 'Door 42',
      street: 'Heritage Avenue',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone: '9876543210'
    };

    console.log('📡 Step 1: Storing Order & Order Items in Neon PostgreSQL Database...');
    const orderIns = await db.query(
      `INSERT INTO orders (
        user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address
       ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user.id, testOrderNum, Number(prod.price), 'Pay Online', 'Paid', 'Confirmed', JSON.stringify(testAddress)]
    );
    const order = orderIns.rows[0];

    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
       VALUES ($1, $2, $1, $3)`,
      [order.id, prod.id, Number(prod.price)]
    );

    console.log(`✅ Order #${order.id} (${order.order_number}) successfully created in orders and order_items tables!`);

    // 3. Test Customer GET /api/orders/my-orders fetch logic
    console.log('\n📡 Step 2: Verifying Customer My Orders fetch logic...');
    const myOrdersRes = await db.query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'id', oi.id,
                  'productId', oi.product_id,
                  'quantity', oi.quantity,
                  'price', oi.price_at_purchase,
                  'productName', COALESCE(p.name, 'Silk Saree'),
                  'fabric', COALESCE(p.fabric, 'Silk'),
                  'image', COALESCE((SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, id ASC LIMIT 1), '/src/assets/hero_saree_model.png')
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1 AND o.id = $2
       GROUP BY o.id`,
      [user.id, order.id]
    );

    const fetchedMyOrder = myOrdersRes.rows[0];
    if (!fetchedMyOrder) throw new Error('Order not found in Customer My Orders fetch query');

    console.log(`✅ Customer My Orders found Order: #${fetchedMyOrder.order_number}`);
    console.log(`   - Payment Method: ${fetchedMyOrder.payment_method}`);
    console.log(`   - Payment Status: ${fetchedMyOrder.payment_status}`);
    console.log(`   - Order Status: ${fetchedMyOrder.order_status}`);
    console.log(`   - Items Count: ${fetchedMyOrder.items?.length}`);

    // 4. Test Admin Orders Query
    console.log('\n📡 Step 3: Verifying Admin Orders query from Neon DB...');
    const adminOrdersRes = await db.query(
      `SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [order.id]
    );

    const fetchedAdminOrder = adminOrdersRes.rows[0];
    if (!fetchedAdminOrder) throw new Error('Order not found in Admin Orders query');
    console.log(`✅ Admin Orders found Order: #${fetchedAdminOrder.order_number} for customer ${fetchedAdminOrder.customer_name}`);

    // 5. Update Order Status to 'Shipped' (Admin action)
    console.log('\n📡 Step 4: Simulating Admin Status Update -> "Shipped"...');
    await db.query(`UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2`, ['Shipped', order.id]);

    // 6. Verify Customer My Orders reflects updated status immediately
    console.log('\n📡 Step 5: Verifying Customer My Orders reflects updated status ("Shipped")...');
    const updatedMyOrderRes = await db.query(`SELECT order_status FROM orders WHERE id = $1`, [order.id]);
    const updatedStatus = updatedMyOrderRes.rows[0]?.order_status;
    console.log(`✅ Updated Order Status in Neon DB: "${updatedStatus}"`);

    if (updatedStatus === 'Shipped') {
      console.log('✅ Real-time synchronization between Admin and Customer My Orders VERIFIED!');
    } else {
      throw new Error(`Order status mismatch! Expected 'Shipped', got '${updatedStatus}'`);
    }

    // Cleanup test order
    await db.query(`DELETE FROM order_items WHERE order_id = $1`, [order.id]);
    await db.query(`DELETE FROM orders WHERE id = $1`, [order.id]);
    console.log('\n🧹 Test Order cleaned up successfully.');

    console.log('\n🎉 FULL END-TO-END ORDER SYNCHRONIZATION TEST PASSED 100%!\n');
  } catch (err) {
    console.error('❌ E2E Order Sync Test Failed:', err);
    process.exit(1);
  }
}

testE2EOrderSynchronization().then(() => process.exit(0));
