const db = require('./db');

async function inspectAllProductImages() {
  try {
    const images = await db.query(`
      SELECT p.id, p.name, pi.id as img_id, pi.image_url, pi.is_primary, LENGTH(pi.image_data) as data_len 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ORDER BY p.id ASC
    `);
    console.log('Product Images Mapping:', JSON.stringify(images.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

inspectAllProductImages();
