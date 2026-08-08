const db = require('../db');

async function clean() {
  try {
    const res = await db.query(
      `DELETE FROM seller_master_data_requests 
       WHERE reason = 'E2E Verification testing' OR reason = 'Test context'`
    );
    console.log(`Cleaned up ${res.rowCount} leftover records.`);
    const itemRes = await db.query("DELETE FROM master_items WHERE name = 'Test Silk Raw'");
    console.log(`Cleaned up ${itemRes.rowCount} leftover master items.`);
  } catch (err) {
    console.error('Error cleaning up:', err.message);
  } finally {
    process.exit(0);
  }
}

clean();
