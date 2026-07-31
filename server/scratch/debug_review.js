const db = require('../db');
const { uploadToCloudinary } = require('../services/cloudinaryService');

async function testSubmit() {
  try {
    const targetId = 12;
    const userId = 1;
    const rating = 5;
    const comment = "Great saree!";
    const reviewerName = "Sumathi";
    const images = ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='];

    let finalImages = [];
    if (Array.isArray(images)) {
      for (const img of images.slice(0, 3)) {
        if (typeof img === 'string') {
          if (img.startsWith('data:')) {
            const cloudUrl = await uploadToCloudinary(img, 'happy_sarees/reviews');
            if (cloudUrl) finalImages.push(cloudUrl);
          } else {
            finalImages.push(img);
          }
        }
      }
    }
    const featuredImg = finalImages.length > 0 ? finalImages[0] : null;

    console.log('FINAL IMAGES:', finalImages);

    const existingCheck = await db.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
      [userId, targetId]
    );

    console.log('EXISTING CHECK:', existingCheck.rows);

    const insertRes = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment, reviewer_name, images, featured_image, status, display_on_homepage)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'pending', false) RETURNING *`,
      [
        targetId,
        userId,
        rating,
        comment,
        reviewerName,
        JSON.stringify(finalImages),
        featuredImg
      ]
    );

    console.log('INSERT RESULT:', insertRes.rows[0]);
  } catch (err) {
    console.error('SUBMIT ERROR EXCEPTION:', err);
  }
}

testSubmit().then(() => process.exit(0));
