const fs = require('fs');
const path = require('path');

const ADMIN_SRC = path.join(__dirname, '../../admin/src');
const USER_SRC = path.join(__dirname, '../../user/src');

function getSourceFiles(dir, filesList = []) {
  if (!fs.existsSync(dir)) return filesList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getSourceFiles(fullPath, filesList);
    } else {
      const ext = path.extname(item);
      if (ext === '.css' || ext === '.js' || ext === '.jsx') {
        filesList.push(fullPath);
      }
    }
  }
  return filesList;
}

const allFiles = [
  ...getSourceFiles(ADMIN_SRC),
  ...getSourceFiles(USER_SRC)
];

console.log(`Found ${allFiles.length} source files to scan/refactor.`);

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Avoid modifying the global CSS token definitions inside the stylesheet root block
  if (filePath.endsWith('global.css')) {
    // We only update typography references and non-root rules in global.css
    // Let's do selective replacement
  }

  // 1. Fonts
  content = content.replace(/font-family:\s*['"]?Playfair\s+Display['"]?,\s*Georgia,\s*serif/gi, 'font-family: var(--font-serif)');
  content = content.replace(/font-family:\s*['"]?Playfair\s+Display['"]?,\s*serif/gi, 'font-family: var(--font-serif)');
  content = content.replace(/font-family:\s*['"]?Great\s+Vibes['"]?,\s*['"]?Caveat['"]?,\s*cursive/gi, 'font-family: var(--font-script)');
  content = content.replace(/font-family:\s*['"]?Alex\s+Brush['"]?,\s*cursive/gi, 'font-family: var(--font-script)');
  content = content.replace(/font-family:\s*['"]?Cinzel['"]?,\s*serif/gi, 'font-family: var(--font-display)');
  content = content.replace(/font-family:\s*['"]?Montserrat['"]?,\s*sans-serif/gi, 'font-family: var(--font-sans)');
  content = content.replace(/font-family:\s*['"]?Inter['"]?,\s*sans-serif/gi, 'font-family: var(--font-sans)');

  // 2. Main Brand Color Hex Codes -> var(--primary-color) & var(--primary-dark) & var(--secondary-color)
  // Ensure we don't rewrite the root variables definitions themselves by matching only where used
  if (!filePath.endsWith('global.css')) {
    content = content.replace(/#d11b69/gi, 'var(--primary-color)');
    content = content.replace(/#b21457/gi, 'var(--primary-dark)');
    content = content.replace(/#9c124e/gi, 'var(--primary-dark)');
    content = content.replace(/#800a39/gi, 'var(--primary-dark)');
    content = content.replace(/#9e1450/gi, 'var(--primary-dark)');
    content = content.replace(/#061feb/gi, 'var(--secondary-color)'); // royal blue -> royal indigo
    content = content.replace(/#27189d/gi, 'var(--secondary-color)'); // brand indigo
  }

  // 3. Status/Badge colors (Success, Warning, Error/Danger, Info)
  content = content.replace(/#2e7d32/gi, 'var(--success-color)');
  content = content.replace(/#e8f5e9/gi, 'var(--success-bg)');
  content = content.replace(/#e65100/gi, 'var(--warning-color)');
  content = content.replace(/#fff3e0/gi, 'var(--warning-bg)');
  content = content.replace(/#c62828/gi, 'var(--error-color)');
  content = content.replace(/#ffebee/gi, 'var(--error-bg)');
  content = content.replace(/#1565c0/gi, 'var(--info-color)');
  content = content.replace(/#e3f2fd/gi, 'var(--info-bg)');

  // 4. Border Radius (Apply --radius-premium: 16px, --radius-input: 10px, --radius-button: 30px)
  if (!filePath.endsWith('global.css')) {
    content = content.replace(/border-radius:\s*16px/gi, 'border-radius: var(--radius-premium)');
    content = content.replace(/border-radius:\s*12px/gi, 'border-radius: var(--radius-premium)');
    content = content.replace(/border-radius:\s*10px/gi, 'border-radius: var(--radius-input)');
    content = content.replace(/border-radius:\s*8px/gi, 'border-radius: var(--radius-input)');
    content = content.replace(/border-radius:\s*6px/gi, 'border-radius: var(--radius-small)');
    content = content.replace(/border-radius:\s*30px/gi, 'border-radius: var(--radius-button)');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${path.relative(path.join(__dirname, '../..'), filePath)}`);
  }
});

console.log('Global Design System brand-aligned pass complete!');
