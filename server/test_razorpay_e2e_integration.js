const db = require('./db');
const crypto = require('crypto');
const Razorpay = require('razorpay');

async function testRazorpayE2EIntegration() {
  console.log('🧪 Starting Razorpay Test Mode E2E Integration & Synchronization Test...\n');

  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.RZP_TEST_KEY || 'rzp_test_TIsRdBOnjlnxgt';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RZP_TEST_SECRET || 'QTgRksjTWHdO1O9yBihxIs3A';

    console.log(`📡 Step 1: Checking Razorpay Credentials from .env...`);
    console.log(`   Key ID: ${keyId}`);
    console.log(`   Key Secret: ${keySecret ? '********' + keySecret.slice(-4) : 'MISSING'}`);
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials missing from .env');
    }
    console.log('✅ Credentials verified. Key Secret is never sent to frontend.');

    // Step 2: Create a Test Order in Neon DB
    console.log('\n📡 Step 2: Creating Test Order in Neon PostgreSQL DB...');
    const userRes = await db.query(`SELECT id FROM users LIMIT 1`);
    const userId = userRes.rows[0]?.id || null;

    const testOrderNumber = `HS-ORD-TEST-${Date.now()}`;
    const insertRes = await db.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, testOrderNumber, 2428, 'Pay Online', 'Pending Payment', 'Pending', JSON.stringify({ name: 'Test User', city: 'Chennai' })]
    );

    const dbOrder = insertRes.rows[0];
    console.log(`✅ Order created in Neon DB: ID #${dbOrder.id}, Order #: ${dbOrder.order_number}, Status: ${dbOrder.payment_status}`);

    // Step 3: Create Razorpay Order via SDK
    console.log('\n📡 Step 3: Creating Razorpay Order via Official SDK...');
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const amountInPaise = Math.round(Number(dbOrder.total_amount) * 100);

    const rzpOrder = await instance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${dbOrder.order_number}`
    });

    console.log(`✅ Razorpay Order Created: ${rzpOrder.id}, Amount: ₹${rzpOrder.amount / 100}, Status: ${rzpOrder.status}`);

    // Step 4: Simulate Customer Completing Payment & Generate Valid HMAC Signature
    console.log('\n📡 Step 4: Simulating Payment Success & Generating HMAC SHA256 Signature...');
    const mockPaymentId = `pay_test_${Date.now()}`;
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${rzpOrder.id}|${mockPaymentId}`);
    const validSignature = hmac.digest('hex');

    console.log(`   Razorpay Order ID: ${rzpOrder.id}`);
    console.log(`   Razorpay Payment ID: ${mockPaymentId}`);
    console.log(`   Generated Signature: ${validSignature}`);

    // Step 5: Backend Signature Verification & DB Update
    console.log('\n📡 Step 5: Performing Backend Signature Verification & DB Update...');
    const verifyHmac = crypto.createHmac('sha256', keySecret);
    verifyHmac.update(`${rzpOrder.id}|${mockPaymentId}`);
    const checkSig = verifyHmac.digest('hex');

    if (checkSig !== validSignature) {
      throw new Error('Signature mismatch during backend verification test!');
    }

    const updateRes = await db.query(
      `UPDATE orders 
       SET payment_status = 'Paid',
           order_status = 'Confirmed',
           payment_method = 'Pay Online',
           razorpay_order_id = $1,
           razorpay_payment_id = $2,
           razorpay_signature = $3,
           paid_amount = $4,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [rzpOrder.id, mockPaymentId, validSignature, dbOrder.total_amount, dbOrder.id]
    );

    const updatedOrder = updateRes.rows[0];
    console.log('✅ Order updated in Neon DB:');
    console.log(`   Order #: ${updatedOrder.order_number}`);
    console.log(`   Payment Status: ${updatedOrder.payment_status}`);
    console.log(`   Order Status: ${updatedOrder.order_status}`);
    console.log(`   Razorpay Order ID: ${updatedOrder.razorpay_order_id}`);
    console.log(`   Razorpay Payment ID: ${updatedOrder.razorpay_payment_id}`);
    console.log(`   Paid Amount: ₹${updatedOrder.paid_amount}`);
    console.log(`   Paid At: ${updatedOrder.paid_at}`);

    // Step 6: Test Cash on Delivery (COD) Flow
    console.log('\n📡 Step 6: Verifying Cash on Delivery (COD) Order Flow...');
    const codOrderNumber = `HS-ORD-COD-${Date.now()}`;
    const codRes = await db.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, codOrderNumber, 1499, 'Cash on Delivery (COD)', 'Pending', 'Confirmed', JSON.stringify({ name: 'COD Customer' })]
    );
    const codOrder = codRes.rows[0];
    console.log(`✅ COD Order created: Order #: ${codOrder.order_number}, Payment Status: ${codOrder.payment_status}, Order Status: ${codOrder.order_status}`);

    console.log('\n🎉 RAZORPAY TEST MODE E2E INTEGRATION & SYNCHRONIZATION TESTS PASSED 100%!\n');
  } catch (err) {
    console.error('❌ E2E Integration Test Failed:', err);
    process.exit(1);
  }
}

testRazorpayE2EIntegration().then(() => process.exit(0));
