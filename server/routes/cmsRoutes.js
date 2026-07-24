const express = require('express');
const router = express.Router();
const db = require('../db');
const cmsService = require('../services/admin/cmsService');

// 1. Get Live Public Announcement Bar
router.get('/announcement-bar', async (req, res) => {
  try {
    const data = await cmsService.getPublicAnnouncementBar();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Public Announcement Bar Error:', error);
    res.json({
      success: true,
      data: {
        enabled: true,
        text: 'FREE SHIPPING ON PREMIUM SILK COLLECTION',
        link: '/shop',
        backgroundColor: '#2b2b2b',
        textColor: '#ffffff'
      }
    });
  }
});

// 2. Get All Public CMS Sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await cmsService.getAllSections();
    res.json({ success: true, sections });
  } catch (error) {
    console.error('Public Sections Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching CMS sections.' });
  }
});

// 3. Get Navigation Menu Data (Occasions & Fabrics dynamically from Neon DB)
router.get('/navigation', async (req, res) => {
  try {
    const [occasionsRes, fabricsRes] = await Promise.all([
      db.query(
        `SELECT mi.name, mi.slug 
         FROM master_items mi 
         JOIN master_types mt ON mi.type_id = mt.id 
         WHERE mt.slug = 'occasions' AND mi.is_active = true 
         ORDER BY mi.sort_order ASC, mi.name ASC`
      ),
      db.query(
        `SELECT mi.name, mi.slug 
         FROM master_items mi 
         JOIN master_types mt ON mi.type_id = mt.id 
         WHERE mt.slug = 'fabrics' AND mi.is_active = true 
         ORDER BY mi.sort_order ASC, mi.name ASC`
      )
    ]);

    const occasions = occasionsRes.rows.map(row => ({
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
      path: `/shop?occasion=${encodeURIComponent(row.slug || row.name.toLowerCase().replace(/\s+/g, '-'))}`
    }));

    const fabrics = fabricsRes.rows.map(row => ({
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, '-'),
      path: `/shop?fabric=${encodeURIComponent(row.slug || row.name.toLowerCase().replace(/\s+/g, '-'))}`
    }));

    res.json({
      success: true,
      occasions: occasions.length > 0 ? occasions : [
        { name: 'Wedding', path: '/shop?occasion=wedding' },
        { name: 'Reception', path: '/shop?occasion=reception' },
        { name: 'Party', path: '/shop?occasion=party' },
        { name: 'Office', path: '/shop?occasion=office' },
        { name: 'Daily Wear', path: '/shop?occasion=daily-wear' },
        { name: 'Festive', path: '/shop?occasion=festive' }
      ],
      fabrics: fabrics.length > 0 ? fabrics : [
        { name: 'Silk', path: '/shop?fabric=silk' },
        { name: 'Cotton', path: '/shop?fabric=cotton' },
        { name: 'Linen', path: '/shop?fabric=linen' },
        { name: 'Organza', path: '/shop?fabric=organza' },
        { name: 'Georgette', path: '/shop?fabric=georgette' },
        { name: 'Tissue', path: '/shop?fabric=tissue' },
        { name: 'Banarasi', path: '/shop?fabric=banarasi' },
        { name: 'Kanchipuram', path: '/shop?fabric=kanchipuram' }
      ]
    });
  } catch (err) {
    console.warn('[cmsRoutes] Navigation fetch warning:', err.message);
    res.json({
      success: true,
      occasions: [
        { name: 'Wedding', path: '/shop?occasion=wedding' },
        { name: 'Reception', path: '/shop?occasion=reception' },
        { name: 'Party', path: '/shop?occasion=party' },
        { name: 'Office', path: '/shop?occasion=office' },
        { name: 'Daily Wear', path: '/shop?occasion=daily-wear' },
        { name: 'Festive', path: '/shop?occasion=festive' }
      ],
      fabrics: [
        { name: 'Silk', path: '/shop?fabric=silk' },
        { name: 'Cotton', path: '/shop?fabric=cotton' },
        { name: 'Linen', path: '/shop?fabric=linen' },
        { name: 'Organza', path: '/shop?fabric=organza' },
        { name: 'Georgette', path: '/shop?fabric=georgette' },
        { name: 'Tissue', path: '/shop?fabric=tissue' },
        { name: 'Banarasi', path: '/shop?fabric=banarasi' },
        { name: 'Kanchipuram', path: '/shop?fabric=kanchipuram' }
      ]
    });
  }
});

module.exports = router;
