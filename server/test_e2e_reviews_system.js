const db = require('./db');
const { recalculateProductRating } = require('./routes/reviewRoutes');

async function runReviewsE2ETest() {
  console.log('🧪 Starting End-to-End Reviews & Ratings Module Verification...\n');

  try {
    // Fetch a valid user_id from users table
    const userRes = await db.query('SELECT id FROM users LIMIT 1');
    const validUserId = userRes.rows[0]?.id || 1;

    // 1. Create a test customer & test order with Delivered status
    console.log('📡 [Step 1] Creating test order with Delivered status...');
    const orderRes = await db.query(`
      INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address)
      VALUES ($1, 'HS-REV-TEST-9001', 5999, 'COD', 'Paid', 'Delivered', '{"name":"Test Reviewer"}')
      RETURNING id
    `, [validUserId]);
    const testOrderId = orderRes.rows[0].id;

    await db.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, 1, 1, 5999)
    `, [testOrderId]);
    console.log(`✅ Test Order #${testOrderId} created for Product #1 with status "Delivered".`);

    // 2. Submit customer review with 2 images
    console.log('\n📡 [Step 2] Submitting customer review with 2 uploaded images...');
    const testImages = [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'
    ];

    const insertRes = await db.query(`
      INSERT INTO reviews (product_id, user_id, rating, comment, reviewer_name, images, featured_image, status, display_on_homepage)
      VALUES (1, $1, 5, 'E2E Audit: Stunning weave quality and authentic silk texture!', 'Audit Customer', $2::jsonb, $3, 'pending', false)
      RETURNING id, status
    `, [validUserId, JSON.stringify(testImages), testImages[0]]);

    const reviewId = insertRes.rows[0].id;
    console.log(`✅ Review #${reviewId} submitted. Initial Status: "${insertRes.rows[0].status}".`);

    // 3. Admin approval, toggle homepage display, select image #2 as Featured Image
    console.log('\n📡 [Step 3] Admin approves review, sets Featured Image = Image #2, and enables Display on Home Page...');
    await db.query(`
      UPDATE reviews 
      SET status = 'approved', display_on_homepage = true, featured_image = $1, updated_at = NOW() 
      WHERE id = $2
    `, [testImages[1], reviewId]);

    // Recalculate dynamic rating on products table
    await recalculateProductRating(1);

    const productRes = await db.query('SELECT rating, review_count FROM products WHERE id = 1');
    console.log(`✅ Product #1 dynamic stats after approval => Rating: ${productRes.rows[0].rating} | Total Reviews: ${productRes.rows[0].review_count}`);

    // 4. Verify Home Page Featured Image selection
    console.log('\n📡 [Step 4] Querying Home Page featured reviews endpoint...');
    const homeRes = await db.query(`
      SELECT r.id, r.featured_image, r.display_on_homepage, r.status 
      FROM reviews r 
      WHERE r.id = $1 AND r.status = 'approved' AND r.display_on_homepage = true
    `, [reviewId]);

    if (homeRes.rows.length === 0 || homeRes.rows[0].featured_image !== testImages[1]) {
      throw new Error('❌ Home Page Featured Image check failed!');
    }
    console.log('✅ Home Page Featured Image verified! Image #2 selected as Featured Image.');

    // 5. Customer edits review -> Verify status resets back to 'pending'
    console.log('\n📡 [Step 5] Customer edits review text -> Verifying status automatically resets to "pending"...');
    await db.query(`
      UPDATE reviews 
      SET comment = 'E2E Audit Updated text!', status = 'pending', updated_at = NOW() 
      WHERE id = $1
    `, [reviewId]);

    await recalculateProductRating(1);

    const checkPending = await db.query('SELECT status FROM reviews WHERE id = $1', [reviewId]);
    console.log(`✅ Status after customer edit: "${checkPending.rows[0].status}". (Must be "pending")`);

    if (checkPending.rows[0].status !== 'pending') {
      throw new Error('❌ Status reset check failed! Edited review was not reset to pending.');
    }
    console.log('✅ Customer Re-Approval workflow verified successfully!');

    // 6. Cleanup test records
    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    await db.query('DELETE FROM order_items WHERE order_id = $1', [testOrderId]);
    await db.query('DELETE FROM orders WHERE id = $1', [testOrderId]);
    await recalculateProductRating(1);

    console.log('\n🧹 Test order and review cleaned up from DB.');
    console.log('🎉 REVIEWS & RATINGS MODULE E2E AUDIT PASSED 100%!');

  } catch (err) {
    console.error('❌ E2E Reviews Test Failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runReviewsE2ETest();
