const db = require('./db');

const defaultImages = {
  'Bridal': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
  'Wedding': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
  'Festive': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
  'Party': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'Casual': 'https://images.unsplash.com/photo-1583391733975-acb2a4f481e3?q=80&w=800&auto=format&fit=crop',
  'Daily Wear': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'Office': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'Puja': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
  'Reception': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
  'Anniversary': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
};

async function update() {
  for (const [name, img] of Object.entries(defaultImages)) {
    await db.query('UPDATE master_items SET image_data = $1 WHERE name = $2 AND (image_data IS NULL OR image_data = $3)', [img, name, '']);
  }
  console.log('Successfully updated default occasion images in Neon DB!');
  process.exit(0);
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
