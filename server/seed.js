const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedDatabase() {
  try {
    console.log('🚀 Starting Neon PostgreSQL Database Initialization & Seeding...');

    // 1. Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await db.query(schemaSql);
    console.log('✅ Database Schema (Tables) created successfully.');

    // 2. Create Initial Admin / Demo User
    const hashedPassword = await bcrypt.hash('sumathi123', 10);
    const userRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Sumathi', 'sumathi@happysarees.com', hashedPassword, '9876543210', 'admin']
    );
    console.log(`✅ Demo User Created (ID: ${userRes.rows[0].id}, Email: sumathi@happysarees.com, Password: sumathi123)`);

    // 3. Create Categories
    const categories = [
      { name: 'Kanchipuram Silk', slug: 'kanchipuram-silk', image: '/src/assets/wedding_saree.png' },
      { name: 'Banarasi Silk', slug: 'banarasi-silk', image: '/src/assets/hero_saree_model.png' },
      { name: 'Organza Sarees', slug: 'organza-sarees', image: '/src/assets/festive_saree.png' },
      { name: 'Chanderi Silk', slug: 'chanderi-silk', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const res = await db.query(
        `INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id`,
        [cat.name, cat.slug, cat.image]
      );
      categoryMap[cat.name] = res.rows[0].id;
    }
    console.log('✅ Categories Seeded.');

    // 4. Products Data
    const productsData = [
      {
        name: 'Royal Magenta Kanchipuram Pure Silk Saree',
        slug: 'royal-magenta-kanchipuram-pure-silk-saree',
        category_name: 'Kanchipuram Silk',
        description: 'Exquisite Kanchipuram Pure Silk Saree woven with pure gold zari thread floral vines across rich magenta silk.',
        price: 16335,
        original_price: 21780,
        fabric: 'Silk',
        color: 'Magenta',
        weave: 'Handloom',
        border: 'Gold Zari Woven',
        pallu: 'Grand Zari Pallu',
        blouse_included: true,
        blouse_size: '0.8 meters',
        height: '5.5 meters',
        width: '1.15 meters',
        weight: '650 Grams',
        occasion: 'Bridal',
        sku: 'HS-KAN-1001',
        in_stock: true,
        stock_count: 15,
        is_best_seller: true,
        is_new_arrival: true,
        rating: 4.9,
        review_count: 248,
        images: [
          '/src/assets/hero_saree_model.png',
          '/src/assets/wedding_saree.png',
          '/src/assets/festive_saree.png'
        ]
      },
      {
        name: 'Crimson Red Heritage Banarasi Silk Saree',
        slug: 'crimson-red-heritage-banarasi-silk-saree',
        category_name: 'Banarasi Silk',
        description: 'Classic Crimson Red Banarasi Silk Saree with intricate silver-gold zari brocade weaving.',
        price: 14850,
        original_price: 19800,
        fabric: 'Silk',
        color: 'Red',
        weave: 'Banarasi Handloom',
        border: 'Broad Zari Border',
        pallu: 'Heavy Brocade Pallu',
        blouse_included: true,
        blouse_size: '0.8 meters',
        height: '5.5 meters',
        width: '1.15 meters',
        weight: '700 Grams',
        occasion: 'Wedding',
        sku: 'HS-BAN-1002',
        in_stock: true,
        stock_count: 12,
        is_best_seller: true,
        is_new_arrival: false,
        rating: 4.8,
        review_count: 192,
        images: [
          '/src/assets/wedding_saree.png',
          '/src/assets/hero_saree_model.png',
          '/src/assets/festive_saree.png'
        ]
      },
      {
        name: 'Peach Organza Printed Floral Saree',
        slug: 'peach-organza-printed-floral-saree',
        category_name: 'Organza Sarees',
        description: 'Lightweight sheer Peach Organza Saree featuring delicate hand-printed floral motifs and fine zari borders.',
        price: 2189,
        original_price: 3499,
        fabric: 'Organza',
        color: 'Pink',
        weave: 'Printed Zari',
        border: 'Thin Zari Border',
        pallu: 'Running Printed Pallu',
        blouse_included: true,
        blouse_size: '0.8 meters',
        height: '5.5 meters',
        width: '1.15 meters',
        weight: '450 Grams',
        occasion: 'Party',
        sku: 'HS-ORG-1003',
        in_stock: true,
        stock_count: 20,
        is_best_seller: true,
        is_new_arrival: true,
        rating: 4.6,
        review_count: 15,
        images: [
          '/src/assets/festive_saree.png',
          '/src/assets/hero_saree_model.png',
          '/src/assets/wedding_saree.png'
        ]
      },
      {
        name: 'Lavender Soft Silk Festive Saree',
        slug: 'lavender-soft-silk-festive-saree',
        category_name: 'Chanderi Silk',
        description: 'Pastel Lavender Soft Silk Saree adorned with silver zari dots and regal pallu.',
        price: 2799,
        original_price: 4499,
        fabric: 'Silk',
        color: 'Lavender',
        weave: 'Handloom',
        border: 'Zari Border',
        pallu: 'Zari Pallu',
        blouse_included: true,
        blouse_size: '0.8 meters',
        height: '5.5 meters',
        width: '1.15 meters',
        weight: '550 Grams',
        occasion: 'Festive',
        sku: 'HS-SLK-1004',
        in_stock: true,
        stock_count: 18,
        is_best_seller: false,
        is_new_arrival: true,
        rating: 4.7,
        review_count: 84,
        images: [
          'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600&auto=format&fit=crop',
          '/src/assets/hero_saree_model.png',
          '/src/assets/wedding_saree.png'
        ]
      }
    ];

    for (const p of productsData) {
      const catId = categoryMap[p.category_name] || null;
      const prodRes = await db.query(
        `INSERT INTO products (
          name, slug, category_id, description, price, original_price, fabric, color, weave,
          border, pallu, blouse_included, blouse_size, height, width, weight, occasion,
          sku, in_stock, stock_count, is_best_seller, is_new_arrival, rating, review_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING id`,
        [
          p.name, p.slug, catId, p.description, p.price, p.original_price, p.fabric, p.color, p.weave,
          p.border, p.pallu, p.blouse_included, p.blouse_size, p.height, p.width, p.weight, p.occasion,
          p.sku, p.in_stock, p.stock_count, p.is_best_seller, p.is_new_arrival, p.rating, p.review_count
        ]
      );
      const productId = prodRes.rows[0].id;

      // Seed product images
      for (let i = 0; i < p.images.length; i++) {
        await db.query(
          `INSERT INTO product_images (product_id, image_url, display_order) VALUES ($1, $2, $3)`,
          [productId, p.images[i], i]
        );
      }
    }

    console.log('✅ All Products and Multi-Angle Images Seeded Successfully!');
    console.log('🎉 Neon PostgreSQL Database Setup Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Neon Database:', error);
    process.exit(1);
  }
}

seedDatabase();
