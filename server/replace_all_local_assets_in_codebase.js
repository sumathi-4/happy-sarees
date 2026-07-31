const fs = require('fs');
const path = require('path');
const db = require('./db');

const ASSET_MAP = {
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg',
  
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476992/happy_sarees/site_assets/hero_banners/xpykrshdixjmpsitocm8.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476992/happy_sarees/site_assets/hero_banners/xpykrshdixjmpsitocm8.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476994/happy_sarees/site_assets/hero_banners/vhqyulqza1xhns1a4cme.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476994/happy_sarees/site_assets/hero_banners/vhqyulqza1xhns1a4cme.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476996/happy_sarees/site_assets/hero_banners/vitdixax6vbhaxp3wslp.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476996/happy_sarees/site_assets/hero_banners/vitdixax6vbhaxp3wslp.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476998/happy_sarees/site_assets/hero_banners/rtg73ngzkyutzme47lxm.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476998/happy_sarees/site_assets/hero_banners/rtg73ngzkyutzme47lxm.jpg',
  
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477013/happy_sarees/site_assets/price_cutouts/cgr7fkcsw84lhsgtslf7.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477013/happy_sarees/site_assets/price_cutouts/cgr7fkcsw84lhsgtslf7.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477014/happy_sarees/site_assets/price_cutouts/iszyfx20414jbu7j3ueu.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477014/happy_sarees/site_assets/price_cutouts/iszyfx20414jbu7j3ueu.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477015/happy_sarees/site_assets/price_cutouts/f7szjystkkrzyjfg0pad.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477015/happy_sarees/site_assets/price_cutouts/f7szjystkkrzyjfg0pad.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477016/happy_sarees/site_assets/price_cutouts/jpxagh6bdogjtmnl07py.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477016/happy_sarees/site_assets/price_cutouts/jpxagh6bdogjtmnl07py.png',
  
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477005/happy_sarees/site_assets/price_cutouts/lz8tjy9ftbzewvddielm.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477005/happy_sarees/site_assets/price_cutouts/lz8tjy9ftbzewvddielm.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477007/happy_sarees/site_assets/price_cutouts/z1y5fqsodvupldwfcgs7.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477007/happy_sarees/site_assets/price_cutouts/z1y5fqsodvupldwfcgs7.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477009/happy_sarees/site_assets/price_cutouts/oy9hqaeshccugas3yqkv.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477009/happy_sarees/site_assets/price_cutouts/oy9hqaeshccugas3yqkv.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477011/happy_sarees/site_assets/price_cutouts/yzxbmu39exo88ag6ptfa.png': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477011/happy_sarees/site_assets/price_cutouts/yzxbmu39exo88ag6ptfa.png',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg',
  'https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg': 'https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg'
};

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [target, replacement] of Object.entries(ASSET_MAP)) {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      changed = true;
    }
  }

  // Replace import statements for static images with string constants
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/hero_banners\/hero_banner_1\.jpg['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476992/happy_sarees/site_assets/hero_banners/xpykrshdixjmpsitocm8.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/hero_banners\/hero_banner_2\.jpg['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476994/happy_sarees/site_assets/hero_banners/vhqyulqza1xhns1a4cme.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/hero_banners\/hero_banner_3\.jpg['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476996/happy_sarees/site_assets/hero_banners/vitdixax6vbhaxp3wslp.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/hero_banners\/hero_banner_4\.jpg['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476998/happy_sarees/site_assets/hero_banners/rtg73ngzkyutzme47lxm.jpg';");
    
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/price_cutouts\/price_cutout_1\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477013/happy_sarees/site_assets/price_cutouts/cgr7fkcsw84lhsgtslf7.png';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/price_cutouts\/price_cutout_2\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477014/happy_sarees/site_assets/price_cutouts/iszyfx20414jbu7j3ueu.png';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/price_cutouts\/price_cutout_3\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477015/happy_sarees/site_assets/price_cutouts/f7szjystkkrzyjfg0pad.png';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/price_cutouts\/price_cutout_4\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477016/happy_sarees/site_assets/price_cutouts/jpxagh6bdogjtmnl07py.png';");
    
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/logo\.jpg['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477003/happy_sarees/site_assets/xl7zr2ufo60tl9ebgm2h.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/hero_saree_model\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477001/happy_sarees/site_assets/kftflffhvk46rayps0tp.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/wedding_saree\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785477020/happy_sarees/site_assets/nul8u04jbmradvbmugy8.jpg';");
    content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/assets\/festive_saree\.png['"];?/g, "const $1 = 'https://res.cloudinary.com/emp49xie/image/upload/v1785476990/happy_sarees/site_assets/xf6gc8iclofggsacglzg.jpg';");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✨ Replaced asset paths in: ${path.basename(filePath)}`);
  }
}

function processDirectoryRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
      processDirectoryRecursive(fullPath);
    } else if (/\.(js|jsx|css|json)$/i.test(entry.name)) {
      replaceInFile(fullPath);
    }
  }
}

async function updateDbSectionImages() {
  console.log('📌 Updating Database Tables with Cloudinary URLs...');
  
  // Replace in product_images table
  for (const [target, replacement] of Object.entries(ASSET_MAP)) {
    await db.query('UPDATE product_images SET image_url = $1 WHERE image_url = $2', [replacement, target]);
    await db.query('UPDATE categories SET image_url = $1 WHERE image_url = $2', [replacement, target]);
  }
  
  console.log('✅ DATABASE TABLES UPDATED WITH 100% CLOUDINARY CDN URLS!');
}

async function run() {
  const userSrc = path.join(__dirname, '../user/src');
  const adminSrc = path.join(__dirname, '../admin/src');
  const serverDir = path.join(__dirname);

  if (fs.existsSync(userSrc)) processDirectoryRecursive(userSrc);
  if (fs.existsSync(adminSrc)) processDirectoryRecursive(adminSrc);
  if (fs.existsSync(serverDir)) processDirectoryRecursive(serverDir);

  await updateDbSectionImages();
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
