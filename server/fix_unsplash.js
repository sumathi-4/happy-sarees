const db = require('./db');

async function fixUnsplashRows() {
  await db.query("UPDATE product_images SET image_url = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477026/happy_sarees/products/qnb314v4vxlpdsx9m64y.jpg' WHERE image_url LIKE '%unsplash%'");
  console.log('✅ ALL UN SPLASH URLS CONVERTED TO CLOUDINARY URLS!');
}

fixUnsplashRows().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
