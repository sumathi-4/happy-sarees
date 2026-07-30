const sharp = require('sharp');
const fs = require('fs');
const path = 'C:/Users/ELCOT/.gemini/antigravity-ide/brain/f997b424-4565-49cf-ba6c-6c1f3dec97c1/media__1785388166425.jpg';
const outDir = 'c:/Users/ELCOT/OneDrive/Desktop/job tasks/happy sarees/user/src/assets/price_cutouts';

async function crop() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const metadata = await sharp(path).metadata();
  console.log('Image dimensions:', metadata.width, metadata.height);

  const width = metadata.width;
  const height = metadata.height;
  const cardW = Math.floor(width / 4);

  for (let i = 0; i < 4; i++) {
    const left = i * cardW;
    await sharp(path)
      .extract({ left, top: 0, width: cardW, height })
      .toFile(`${outDir}/card_frame_${i + 1}.png`);
    console.log(`Saved card_frame_${i + 1}.png`);
  }
}

crop().catch(console.error);
