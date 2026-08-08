const fs = require('fs');
const path = require('path');

const adminStylesDir = path.join(__dirname, '../../admin/src/styles');
const sellerStylesDir = path.join(__dirname, '../../seller/src/styles');

const filesToCopy = [
  { from: 'ProductForm.module.css', to: 'ProductForm.module.css' },
  { from: 'ProductManagement.module.css', to: 'ProductList.module.css' },
  { from: 'AdminDashboard.module.css', to: 'Dashboard.module.css' },
  { from: 'OrdersManagement.module.css', to: 'Orders.module.css' },
  { from: 'Components.module.css', to: 'Components.module.css' },
  { from: 'MasterDataManagement.module.css', to: 'MasterDataManagement.module.css' }
];

console.log('Copying CSS files from Admin to Seller...');

filesToCopy.forEach(f => {
  const src = path.join(adminStylesDir, f.from);
  const dest = path.join(sellerStylesDir, f.to);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${f.from} -> ${f.to}`);
  } else {
    console.warn(`Source file not found: ${src}`);
  }
});

console.log('CSS sync complete.');
