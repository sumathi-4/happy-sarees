/**
 * HAPPY SAREES — MASTER UI REFACTOR SCRIPT
 * 
 * Performs a multi-pass refactor across all CSS/JSX files in user/ and admin/
 * to replace hardcoded values with design tokens.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const USER_SRC = path.join(ROOT, 'user/src');
const ADMIN_SRC = path.join(ROOT, 'admin/src');

let totalChanged = 0;
const changedFiles = [];

function getAllFiles(dir, exts = ['.css', '.jsx', '.js'], files = []) {
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) getAllFiles(full, exts, files);
    else if (exts.includes(path.extname(item))) files.push(full);
  }
  return files;
}

function applyReplacements(content, filePath) {
  let c = content;
  const isGlobalCSS = filePath.includes('global.css');
  const isCSSFile = filePath.endsWith('.css');

  // ══════════════════════════════════════════════
  // 1. FONT FAMILIES → CSS VARIABLES
  // ══════════════════════════════════════════════
  c = c.replace(/font-family:\s*['"]Playfair\s+Display['"]\s*,\s*['"]?(?:Georgia|serif)['"]?/gi,
    "font-family: var(--font-serif)");
  c = c.replace(/font-family:\s*['"]Playfair\s+Display['"]\s*,\s*['"]?Cinzel['"]?\s*,\s*serif/gi,
    "font-family: var(--font-serif)");
  c = c.replace(/font-family:\s*['"]Playfair\s+Display['"]?\s*,\s*serif/gi,
    "font-family: var(--font-serif)");
  c = c.replace(/font-family:\s*['"]Cinzel['"]\s*,\s*serif/gi,
    "font-family: var(--font-display)");
  c = c.replace(/font-family:\s*['"]Alex\s+Brush['"]\s*,\s*cursive/gi,
    "font-family: var(--font-script)");
  c = c.replace(/font-family:\s*['"]Great\s+Vibes['"]\s*,\s*['"]?Caveat['"]?\s*,\s*cursive/gi,
    "font-family: var(--font-script)");
  c = c.replace(/font-family:\s*['"]?(?:Montserrat|Inter|system-ui)['"]\s*,\s*sans-serif/gi,
    "font-family: var(--font-sans)");
  c = c.replace(/font-family:\s*['"]Inter['"]/gi, "font-family: var(--font-sans)");

  // ══════════════════════════════════════════════
  // 2. HARDCODED COLORS → CSS VARIABLES
  // (skip global.css :root section)
  // ══════════════════════════════════════════════
  if (!isGlobalCSS) {
    // Primary colors
    c = c.replace(/#[Dd]11[Bb]69/g, 'var(--primary-color)');
    c = c.replace(/#[Cc][Dd]1169/g, 'var(--primary-color)');
    c = c.replace(/#9[Ee]1450/g, 'var(--primary-dark)');
    c = c.replace(/#9[Cc]0[Cc]4[Aa]/g, 'var(--primary-dark)');
    c = c.replace(/#9c124e/gi, 'var(--primary-dark)');
    c = c.replace(/#800a39/gi, 'var(--primary-dark)');
    c = c.replace(/#b21457/gi, 'var(--primary-dark)');
    c = c.replace(/#c81e1e/gi, 'var(--error-color)');

    // Secondary / indigo
    c = c.replace(/#27189[Dd]/g, 'var(--secondary-color)');
    c = c.replace(/#061[Ff][Ee][Bb]/g, 'var(--secondary-color)');
    c = c.replace(/#1a0f6e/gi, 'var(--secondary-color)');

    // Gold
    c = c.replace(/#[Cc]5[Aa]059/g, 'var(--gold-color)');
    c = c.replace(/#[Aa]88444/g, 'var(--gold-hover)');
    c = c.replace(/#[Cc]8[Aa]02[Dd]/gi, 'var(--gold-hover)');

    // Accents
    c = c.replace(/#[Dd]38[Dd][Bb]1/g, 'var(--accent-blush)');
    c = c.replace(/#[Aa][Ee]93[Dd]9/g, 'var(--accent-lavender)');
    c = c.replace(/#811[Cc]4[Ee]/g, 'var(--deep-rose)');

    // Backgrounds / whites
    c = c.replace(/#[Ff][Ee][Ff]8[Ff]9/g, 'var(--bg-soft-pink)');
    c = c.replace(/#[Ff][Bb][Ee][Bb][Ee][Dd]/g, 'var(--bg-soft-pink-darker)');
    c = c.replace(/#[Ff][Cc][Ff]9[Ff]9/gi, 'var(--bg-soft-pink)');  // old soft-cream
    c = c.replace(/#[Ff][Dd][Ff][Aa][Ff][Bb]/gi, 'var(--bg-soft-pink)');
    c = c.replace(/(?<![a-zA-Z0-9])#[Ff][Ff][Ff][Ff][Ff][Ff](?![a-zA-Z0-9])/g, 'var(--bg-white)');
    c = c.replace(/(?<![a-zA-Z0-9])#[Ff][Ff][Ff](?![a-zA-Z0-9])/g, 'var(--bg-white)');

    // Text colors
    c = c.replace(/#2[Bb]2[Bb]2[Bb]/g, 'var(--text-color)');
    c = c.replace(/#2[Bb]1220/g, 'var(--text-color)');
    c = c.replace(/#666666/g, 'var(--text-muted)');
    c = c.replace(/#999999/g, 'var(--text-light)');
    c = c.replace(/#6[Bb]5[Ee]62/gi, 'var(--text-muted)');
    c = c.replace(/#9[Ee]8[Ee]94/gi, 'var(--text-light)');

    // Borders
    c = c.replace(/#[Ff]2[Ee]1[Ee]7/gi, 'var(--border-color)');
    c = c.replace(/#[Ff]0[Dd]9[Ee]0/gi, 'var(--border-color)');
    c = c.replace(/#[Ff][Bb][Ee][Bb][Ee][Dd]/g, 'var(--bg-soft-pink-darker)');

    // STATUS COLORS — standardize to 4 canonical values
    // Success greens → success-color/success-bg
    c = c.replace(/#2[Ee]7[Dd]32/gi, 'var(--success-color)');
    c = c.replace(/#27[Aa][Ee]60/gi, 'var(--success-color)');
    c = c.replace(/#4[Cc][Aa][Ff]50/gi, 'var(--success-color)');
    c = c.replace(/#4[Cc][Aa][Ff]51/gi, 'var(--success-color)');
    c = c.replace(/#38[Aa]169/gi, 'var(--success-color)');
    c = c.replace(/#16[Aa]34[Aa]/gi, 'var(--success-color)');
    c = c.replace(/#[Ee]8[Ff]5[Ee]9/g, 'var(--success-bg)');
    c = c.replace(/#[Ff]0[Ff][Ff][Ff][Ff]/gi, 'var(--success-bg)');
    c = c.replace(/#[Dd][Cc][Ff][Cc][Ee]0/gi, 'var(--success-bg)');

    // Warning ambers → warning-color/warning-bg
    c = c.replace(/#[Ee]65100/gi, 'var(--warning-color)');
    c = c.replace(/#[Ff]57[Cc]00/gi, 'var(--warning-color)');
    c = c.replace(/#[Ee][Dd]6[Cc]00/gi, 'var(--warning-color)');
    c = c.replace(/#[Ff][Ff][Ff]3[Ee]0/g, 'var(--warning-bg)');
    c = c.replace(/#[Ff][Ff][Ff][Bb][Ee]0/gi, 'var(--warning-bg)');
    c = c.replace(/#[Ff][Ee][Ff]3[Ee]0/gi, 'var(--warning-bg)');

    // Error reds → error-color/error-bg
    c = c.replace(/#[Cc]62828/gi, 'var(--error-color)');
    c = c.replace(/#[Dd]32[Ff]2[Ff]/gi, 'var(--error-color)');
    c = c.replace(/#[Ee][Ff]4444/gi, 'var(--error-color)');
    c = c.replace(/#[Ff][Ff][Ee][Bb][Ee][Ee]/g, 'var(--error-bg)');
    c = c.replace(/#[Ff][Dd][Ff]2[Ff]2/gi, 'var(--error-bg)');
    c = c.replace(/#[Ff][Ee][Ee][Dd][Ee][Dd]/gi, 'var(--error-bg)');

    // Info blues → info-color/info-bg
    c = c.replace(/#1565[Cc]0/gi, 'var(--info-color)');
    c = c.replace(/#3[Bb]82[Ff]6/gi, 'var(--info-color)');
    c = c.replace(/#[Ee]3[Ff]2[Ff][Dd]/g, 'var(--info-bg)');
    c = c.replace(/#[Ee][Ff][Ff]5[Ff][Ff]/gi, 'var(--info-bg)');

    // Shadows with hardcoded rgba
    c = c.replace(/rgba\(43,\s*43,\s*43,\s*(0\.\d+)\)/g, `rgba(43, 18, 32, $1)`);
    c = c.replace(/rgba\(43,\s*37,\s*39,\s*(0\.\d+)\)/g, `rgba(43, 18, 32, $1)`);
    c = c.replace(/rgba\(0,\s*0,\s*0,\s*0\.04\)/gi, 'rgba(43, 18, 32, 0.04)');
    c = c.replace(/rgba\(0,\s*0,\s*0,\s*0\.05\)/gi, 'rgba(43, 18, 32, 0.05)');
    c = c.replace(/rgba\(0,\s*0,\s*0,\s*0\.06\)/gi, 'rgba(43, 18, 32, 0.06)');
    c = c.replace(/rgba\(0,\s*0,\s*0,\s*0\.08\)/gi, 'rgba(43, 18, 32, 0.06)');
  }

  // ══════════════════════════════════════════════
  // 3. BORDER RADIUS → CSS VARIABLES (CSS files only)
  // ══════════════════════════════════════════════
  if (isCSSFile && !isGlobalCSS) {
    c = c.replace(/border-radius:\s*30px/g, 'border-radius: var(--radius-button)');
    c = c.replace(/border-radius:\s*50px/g, 'border-radius: var(--radius-button)');
    c = c.replace(/border-radius:\s*16px/g, 'border-radius: var(--radius-premium)');
    c = c.replace(/border-radius:\s*10px/g, 'border-radius: var(--radius-input)');
    c = c.replace(/border-radius:\s*8px/g,  'border-radius: var(--radius-input)');
    c = c.replace(/border-radius:\s*6px/g,  'border-radius: var(--radius-small)');
    c = c.replace(/border-radius:\s*4px/g,  'border-radius: var(--radius-small)');
    c = c.replace(/border-radius:\s*24px/g, 'border-radius: var(--radius-large)');
  }

  // ══════════════════════════════════════════════
  // 4. HEADING WEIGHT: upgrade 600 → 800 in CSS
  // ══════════════════════════════════════════════
  if (isCSSFile && !isGlobalCSS) {
    // h1/h2/h3/h4 font-weight: 600/700 → 800
    // Also headings in selectors like .title, .heading, .sectionTitle
    c = c.replace(/(\.(?:title|heading|sectionTitle|pageTitle|cardTitle|statTitle|dashTitle|h1|h2|h3)[^{]*\{[^}]*?)font-weight:\s*(?:600|700)/g,
      '$1font-weight: 800');
  }

  return c;
}

const allFiles = [
  ...getAllFiles(USER_SRC),
  ...getAllFiles(ADMIN_SRC)
];

console.log(`\nScanning ${allFiles.length} files...\n`);

for (const filePath of allFiles) {
  try {
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = applyReplacements(original, filePath);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated, 'utf8');
      totalChanged++;
      const rel = path.relative(ROOT, filePath);
      changedFiles.push(rel);
      console.log(`  ✓ ${rel}`);
    }
  } catch (err) {
    console.error(`  ✗ Error in ${filePath}: ${err.message}`);
  }
}

console.log(`\n✅ Refactored ${totalChanged} files.\n`);
console.log('Changed files:\n' + changedFiles.join('\n'));
