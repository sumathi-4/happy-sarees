const db = require('./db');
const bcrypt = require('bcryptjs');

async function fixAdminPasswords() {
  console.log('🔒 Resetting Admin Account Passwords in Neon Database...');

  const hashAdmin = await bcrypt.hash('Admin@2026', 10);
  const hashSumathi = await bcrypt.hash('sumathi123', 10);

  // 1. Super Admin
  await db.query(`UPDATE admin_users SET password_hash = $1 WHERE email = $2`, [hashAdmin, 'admin@happysarees.com']);

  // 2. Sumathi Admin
  const checkSumathi = await db.query(`SELECT * FROM admin_users WHERE email = $1`, ['sumathi@happysarees.com']);
  if (checkSumathi.rows.length === 0) {
    const roleRes = await db.query(`SELECT id FROM admin_roles WHERE name = 'Super Admin' OR name = 'Admin' LIMIT 1`);
    const roleId = roleRes.rows[0]?.id || 1;
    await db.query(
      `INSERT INTO admin_users (name, email, password_hash, role_id, status) VALUES ($1, $2, $3, $4, 'active')`,
      ['Sumathi Admin', 'sumathi@happysarees.com', hashSumathi, roleId]
    );
    console.log('✅ Created sumathi@happysarees.com admin user.');
  } else {
    await db.query(`UPDATE admin_users SET password_hash = $1 WHERE email = $2`, [hashSumathi, 'sumathi@happysarees.com']);
    console.log('✅ Updated sumathi@happysarees.com password.');
  }

  // Also sync customer user account if needed
  const checkUserSumathi = await db.query(`SELECT * FROM users WHERE email = $1`, ['sumathi@happysarees.com']);
  if (checkUserSumathi.rows.length > 0) {
    await db.query(`UPDATE users SET password_hash = $1 WHERE email = $2`, [hashSumathi, 'sumathi@happysarees.com']);
  }

  const admins = await db.query(`SELECT id, name, email, status FROM admin_users`);
  console.log('✅ VERIFIED ADMIN ACCOUNTS IN DATABASE:');
  admins.rows.forEach(a => console.log(`   - ID: ${a.id} | Email: ${a.email} | Status: ${a.status}`));
}

fixAdminPasswords()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Reset error:', err);
    process.exit(1);
  });
