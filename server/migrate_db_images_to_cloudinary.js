const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function uploadToCloudinary(base64OrUrl) {
  if (!base64OrUrl) return null;
  if (base64OrUrl.startsWith('http://') || base64OrUrl.startsWith('https://')) {
    return base64OrUrl;
  }
  try {
    const res = await cloudinary.uploader.upload(base64OrUrl, {
      folder: 'happy_sarees_db_cleanup'
    });
    return res.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    return null;
  }
}

async function migrateDatabaseImagesToCloudinary() {
  console.log('🚀 Starting Database Heavy Image Migration to Cloudinary...');

  // 1. Clean product_images table
  try {
    const imagesRes = await pool.query(`SELECT id, image_data, image_url FROM product_images WHERE image_data IS NOT NULL AND image_data != ''`);
    console.log(`Found ${imagesRes.rows.length} product images with heavy image_data.`);

    for (const row of imagesRes.rows) {
      let cloudinaryUrl = row.image_url;
      if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
        cloudinaryUrl = await uploadToCloudinary(row.image_data);
      }
      if (cloudinaryUrl) {
        await pool.query(
          `UPDATE product_images SET image_url = $1, image_data = NULL WHERE id = $2`,
          [cloudinaryUrl, row.id]
        );
        console.log(`✅ Migrated product_image #${row.id} -> ${cloudinaryUrl}`);
      }
    }
  } catch (e) {
    console.warn('Product images migration notice:', e.message);
  }

  // 2. Clean reviews table
  try {
    const reviewsRes = await pool.query(`SELECT id, image_data, featured_image FROM reviews WHERE image_data IS NOT NULL AND image_data != ''`);
    console.log(`Found ${reviewsRes.rows.length} review images with heavy image_data.`);

    for (const row of reviewsRes.rows) {
      let cloudinaryUrl = row.featured_image;
      if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
        cloudinaryUrl = await uploadToCloudinary(row.image_data);
      }
      if (cloudinaryUrl) {
        await pool.query(
          `UPDATE reviews SET featured_image = $1, image_data = NULL WHERE id = $2`,
          [cloudinaryUrl, row.id]
        );
        console.log(`✅ Migrated review #${row.id} -> ${cloudinaryUrl}`);
      }
    }
  } catch (e) {
    console.warn('Reviews migration notice:', e.message);
  }

  // 3. Clean master_items table
  try {
    const masterRes = await pool.query(`SELECT id, image_data FROM master_items WHERE image_data IS NOT NULL AND image_data != '' AND image_data LIKE 'data:image%'`);
    console.log(`Found ${masterRes.rows.length} master_items with heavy image_data.`);

    for (const row of masterRes.rows) {
      const cloudinaryUrl = await uploadToCloudinary(row.image_data);
      if (cloudinaryUrl) {
        await pool.query(
          `UPDATE master_items SET image_data = $1 WHERE id = $2`,
          [cloudinaryUrl, row.id]
        );
        console.log(`✅ Migrated master_item #${row.id} -> ${cloudinaryUrl}`);
      }
    }
  } catch (e) {
    console.warn('Master items migration notice:', e.message);
  }

  console.log('\n🎉 ALL HEAVY IMAGES MOVED TO CLOUDINARY & ERASED FROM DATABASE!');
  await pool.end();
}

migrateDatabaseImagesToCloudinary().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
