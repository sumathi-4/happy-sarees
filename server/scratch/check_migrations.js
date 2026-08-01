require('dotenv').config({ path: 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/.env' });
const db = require('c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/server/db');

async function check() {
  const products = await db.query("SELECT id, name, fabric, color, weave, border, occasion FROM products WHERE deleted_at IS NULL");
  console.log(`Checking ${products.rows.length} products...`);

  const masterTypes = await db.query("SELECT * FROM master_types");
  const typesMap = {};
  masterTypes.rows.forEach(t => {
    typesMap[t.slug] = t.id;
  });

  for (const prod of products.rows) {
    console.log(`\nProduct #${prod.id}: ${prod.name}`);
    const specs = await db.query("SELECT ps.*, mt.slug as type_slug FROM product_specifications ps JOIN master_types mt ON ps.master_type_id = mt.id WHERE ps.product_id = $1", [prod.id]);
    const specsMap = {};
    specs.rows.forEach(s => {
      specsMap[s.type_slug] = s;
    });

    const checkFields = {
      fabrics: prod.fabric,
      colors: prod.color,
      weaves: prod.weave,
      borders: prod.border,
      occasions: prod.occasion
    };

    Object.keys(checkFields).forEach(typeSlug => {
      const dbVal = checkFields[typeSlug];
      const spec = specsMap[typeSlug];
      if (dbVal) {
        if (!spec) {
          console.log(`  [-] Missing spec mapping for ${typeSlug}: product has "${dbVal}" but no row in product_specifications.`);
        } else {
          console.log(`  [+] Mapped: ${typeSlug} -> "${dbVal}" (spec table has "${spec.custom_value}" / item_id: ${spec.master_value_id})`);
        }
      }
    });
  }

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
