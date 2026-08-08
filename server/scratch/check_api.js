const service = require('../services/admin/masterDataService');

async function test() {
  try {
    const types = await service.getAllTypes();
    console.log('First master type:', types[0]);

    const items = await service.getAllItems();
    console.log('First master item:', items[0]);

    const typeSlug = types[0].slug;
    const itemsByType = await service.getItems(typeSlug);
    console.log('First item of first type:', itemsByType.items[0]);

    console.log('Service check passed successfully!');
  } catch (err) {
    console.error('Service check failed:', err);
  } finally {
    process.exit(0);
  }
}

test();
