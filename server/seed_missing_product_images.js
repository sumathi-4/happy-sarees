const db = require('./db');

async function seedMissingProductImages() {
  try {
    const productsRes = await db.query(`
      SELECT p.id, p.name 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id 
      WHERE pi.id IS NULL
    `);

    const defaultImages = [
      'https://res.cloudinary.com/emp49xie/image/upload/v1784961973/happy_sarees/products/oeriadfocie0laokxlrk.jpg',
      'https://res.cloudinary.com/emp49xie/image/upload/v1784961974/happy_sarees/products/bkxivounub9n9rl22ssx.jpg',
      'https://res.cloudinary.com/emp49xie/image/upload/v1784961970/happy_sarees/products/gobrhlp4bdqgisfe2jmv.jpg'
    ];

    console.log(`Found ${productsRes.rows.length} products with missing images.`);

    for (let i = 0; i < productsRes.rows.length; i++) {
      const p = productsRes.rows[i];
      const imgUrl = defaultImages[i % defaultImages.length];
      await db.query(`
        INSERT INTO product_images (product_id, image_url, is_primary) 
        VALUES ($1, $2, true)
      `, [p.id, imgUrl]);
      console.log(`✅ Assigned image to product #${p.id} (${p.name})`);
    }

    console.log('🎉 All products now have valid primary images in Neon PostgreSQL DB!');
  } catch (err) {
    console.error('❌ Error seeding product images:', err);
  } finally {
    process.exit(0);
  }
}

seedMissingProductImages();
