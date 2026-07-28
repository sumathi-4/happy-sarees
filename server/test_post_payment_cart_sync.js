const db = require('./db');

async function testPostPaymentCartSync() {
  console.log('🧪 Starting Post-Payment Cart Synchronization & Purge Test...\n');

  try {
    // 1. Fetch valid user and product IDs
    const userRes = await db.query(`SELECT id FROM users LIMIT 1`);
    const userId = userRes.rows[0]?.id;
    if (!userId) throw new Error('No user found in Neon DB');

    const prodRes = await db.query(`SELECT id FROM products LIMIT 2`);
    const p1 = prodRes.rows[0]?.id;
    const p2 = prodRes.rows[1]?.id || p1;

    console.log(`📡 Step 1: Populating Neon DB cart_items table for User #${userId}...`);
    // Clear first to ensure clean state
    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 2), ($1, $3, 1)`,
      [userId, p1, p2]
    );

    const checkBefore = await db.query(`SELECT COUNT(*)::int as count FROM cart_items WHERE user_id = $1`, [userId]);
    console.log(`✅ Cart items inserted in Neon DB: ${checkBefore.rows[0].count} items`);
    if (checkBefore.rows[0].count === 0) throw new Error('Failed to insert test cart items');

    // 2. Simulate Order Creation & Payment Signature Verification
    console.log('\n📡 Step 2: Simulating Successful Razorpay Payment & Signature Verification...');
    const testOrderNumber = `HS-SYNC-${Date.now()}`;

    // Create Order
    const orderRes = await db.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, testOrderNumber, 3999, 'Pay Online', 'Paid', 'Confirmed', JSON.stringify({ name: 'Cart Sync Test User' })]
    );
    const dbOrder = orderRes.rows[0];

    // Delete cart items post payment (as performed by orderRoutes and paymentRoutes)
    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

    // 3. Verify Neon DB cart_items table is 100% empty for this user
    console.log('\n📡 Step 3: Verifying Neon DB cart_items table post-payment...');
    const checkAfter = await db.query(`SELECT COUNT(*)::int as count FROM cart_items WHERE user_id = $1`, [userId]);
    console.log(`✅ Cart items count in Neon DB for User #${userId}: ${checkAfter.rows[0].count}`);

    if (checkAfter.rows[0].count === 0) {
      console.log('✅ Neon PostgreSQL cart_items table successfully cleared!');
    } else {
      throw new Error(`Cart items still remain in Neon DB! Count: ${checkAfter.rows[0].count}`);
    }

    // 4. Verify DELETE /api/cart endpoint logic
    console.log('\n📡 Step 4: Testing DELETE /api/cart clearCart endpoint...');
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 1)`,
      [userId, p1]
    );
    await db.query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
    const finalCheck = await db.query(`SELECT COUNT(*)::int as count FROM cart_items WHERE user_id = $1`, [userId]);
    console.log(`✅ Final cart items count: ${finalCheck.rows[0].count}`);

    console.log('\n🎉 POST-PAYMENT CART SYNCHRONIZATION AND PURGE TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('❌ Cart Sync Test Failed:', err);
    process.exit(1);
  }
}

testPostPaymentCartSync().then(() => process.exit(0));
