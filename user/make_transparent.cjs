const sharp = require('sharp');
const fs = require('fs');

const dir = 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/user/src/assets/price_cutouts';

async function processFrames() {
  for (let i = 1; i <= 4; i++) {
    const filePath = `${dir}/card_frame_${i}.png`;
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Iterate through pixels and set alpha=0 for background checkerboard (grey/white squares)
    for (let p = 0; p < data.length; p += 4) {
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      // Checkerboard pixels are light grey/white where R,G,B are almost identical and bright (>180)
      if (r > 185 && g > 185 && b > 185 && maxDiff < 18) {
        data[p + 3] = 0; // Set Alpha to 0 (transparent)
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toFile(`${dir}/card_frame_${i}_clean.png`);

    // Replace original
    fs.copyFileSync(`${dir}/card_frame_${i}_clean.png`, filePath);
    fs.unlinkSync(`${dir}/card_frame_${i}_clean.png`);
    console.log(`Cleaned background transparency for card_frame_${i}.png`);
  }
}

processFrames().catch(console.error);
