const db = require('../db');
const service = require('../services/admin/masterDataService');

async function test() {
  try {
    const items = await service.getAllItems();
    console.log('First master item:', items[0]);

    if (items.length > 0) {
      const typeSlugRes = await db.pool.query('SELECT slug FROM master_types WHERE id = $1', [items[0].typeId]);
      if (typeSlugRes.rows.length > 0) {
        const typeSlug = typeSlugRes.rows[0].slug;
        const itemsByType = await service.getItems(typeSlug);
        console.log('First item of type:', itemsByType.items[0]);
      }
    }

    console.log('Service check passed successfully!');
  } catch (err) {
    console.error('Service check failed:', err);
  } finally {
    await db.pool.end();
    process.exit(0);
  }
}

test();
