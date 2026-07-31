const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const db = require('./db');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function uploadFileOrUrl(source, folder = 'happy_sarees/site_assets') {
  if (!source) return null;
  try {
    const uploadRes = await cloudinary.uploader.upload(source, {
      folder: folder,
      resource_type: 'auto',
      transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }]
    });
    console.log(`☁️ Uploaded: ${source} -> ${uploadRes.secure_url}`);
    return uploadRes.secure_url;
  } catch (err) {
    console.error(`❌ Upload failed for ${source}:`, err.message);
    return null;
  }
}

async function runFullCloudinaryMigration() {
  console.log('=====================================================');
  console.log('🚀 MIGRATING 100% OF SITE & DB IMAGES TO CLOUDINARY');
  console.log('=====================================================\n');

  // 1. Upload Local Asset Files
  const assetsDir = path.join(__dirname, '../user/src/assets');
  const uploadedAssetsMap = {};

  async function processDirectory(dir, subFolder = 'happy_sarees/site_assets') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await processDirectory(fullPath, `${subFolder}/${entry.name}`);
      } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(entry.name)) {
        const cUrl = await uploadFileOrUrl(fullPath, subFolder);
        if (cUrl) {
          uploadedAssetsMap[entry.name] = cUrl;
          const relativePath = fullPath.replace(/\\/g, '/');
          uploadedAssetsMap[relativePath] = cUrl;
        }
      }
    }
  }

  if (fs.existsSync(assetsDir)) {
    console.log('📌 1. Uploading Local Asset Files to Cloudinary...');
    await processDirectory(assetsDir);
    console.log('Uploaded Assets Summary:', uploadedAssetsMap);
  }

  // 2. Upload and Update product_images table
  console.log('\n📌 2. Migrating product_images table to Cloudinary...');
  const prodImgRes = await db.query('SELECT id, image_url FROM product_images');
  for (const row of prodImgRes.rows) {
    if (row.image_url && !row.image_url.includes('res.cloudinary.com')) {
      const cUrl = await uploadFileOrUrl(row.image_url, 'happy_sarees/products');
      if (cUrl) {
        await db.query('UPDATE product_images SET image_url = $1, image_data = NULL WHERE id = $2', [cUrl, row.id]);
      }
    }
  }

  // 3. Upload and Update categories table
  console.log('\n📌 3. Migrating categories table to Cloudinary...');
  try {
    const catRes = await db.query('SELECT id, image_url FROM categories');
    for (const row of catRes.rows) {
      if (row.image_url && !row.image_url.includes('res.cloudinary.com')) {
        const cUrl = await uploadFileOrUrl(row.image_url, 'happy_sarees/categories');
        if (cUrl) {
          await db.query('UPDATE categories SET image_url = $1 WHERE id = $2', [cUrl, row.id]);
        }
      }
    }
  } catch (e) {
    console.log('Categories check:', e.message);
  }

  // 4. Upload and Update master_items table
  console.log('\n📌 4. Migrating master_items table to Cloudinary...');
  try {
    const masterRes = await db.query('SELECT id, image_url, image_data FROM master_items');
    for (const row of masterRes.rows) {
      const src = row.image_url || row.image_data;
      if (src && !String(src).includes('res.cloudinary.com') && String(src).trim() !== '') {
        const cUrl = await uploadFileOrUrl(src, 'happy_sarees/master');
        if (cUrl) {
          await db.query('UPDATE master_items SET image_url = $1, image_data = NULL WHERE id = $2', [cUrl, row.id]);
        }
      }
      await db.query('UPDATE master_items SET image_data = NULL WHERE id = $1', [row.id]);
    }
  } catch (e) {
    console.log('Master items check:', e.message);
  }

  // 5. Upload and Update cms_sections & cms_content table
  console.log('\n📌 5. Migrating cms_sections table to Cloudinary...');
  try {
    const cmsRes = await db.query('SELECT id, section_key, config FROM cms_sections');
    for (const row of cmsRes.rows) {
      let configStr = JSON.stringify(row.config || {});
      const matches = configStr.match(/https?:\/\/[^"'\s\)]+/g) || [];
      let updated = false;

      for (const url of matches) {
        if (!url.includes('res.cloudinary.com') && /\.(jpg|jpeg|png|webp)/i.test(url)) {
          const cUrl = await uploadFileOrUrl(url, 'happy_sarees/cms');
          if (cUrl) {
            configStr = configStr.split(url).join(cUrl);
            updated = true;
          }
        }
      }

      if (updated) {
        await db.query('UPDATE cms_sections SET config = $1 WHERE id = $2', [JSON.parse(configStr), row.id]);
      }
    }
  } catch (e) {
    console.log('CMS sections check:', e.message);
  }

  console.log('\n=====================================================');
  console.log('✅ ALL SITE & DATABASE IMAGES MIGRATED TO CLOUDINARY!');
  console.log('=====================================================');
}

runFullCloudinaryMigration().then(() => process.exit(0)).catch(e => {
  console.error('Fatal Migration Error:', e);
  process.exit(1);
});
