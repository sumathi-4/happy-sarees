const db = require('../db');

async function addOrder() {
  const o = await db.query("INSERT INTO orders (user_id, order_number, total_amount, payment_method, payment_status, order_status, shipping_address) VALUES (1, 'HS-ORD-TEST-12', 610, 'Pay Online', 'Paid', 'Confirmed', '{}') RETURNING id");
  await db.query("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, 12, 1, 610)", [o.rows[0].id]);
  console.log('✅ Created confirmed test order for User 1 product 12!');
}

addOrder().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
