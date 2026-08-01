const fs = require('fs');
const content = fs.readFileSync('c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/admin/src/pages/MasterDataManagement.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('masterKeys') || line.includes('selectedType') || line.includes('editingTypeKey')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
