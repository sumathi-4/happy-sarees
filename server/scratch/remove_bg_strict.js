const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = "C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\6702231e-5a58-45b9-ab80-5dc05ac58a8f\\.user_uploaded\\media__1785539729432.png";
const outputPath = "c:\\Users\\ELCOT\\OneDrive\\Desktop\\job tasks\\happy sarees\\user\\public\\images\\why_choose_us_models.png";

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Image dimensions: ${this.width} x ${this.height}`);

    let countRemoved = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        // Background is neutral grey/off-white (R, G, B are very close to each other and bright)
        // Background color range in this PNG is RGB (220..248, 220..248, 220..248)
        const isNeutral = Math.abs(r - g) <= 12 && Math.abs(g - b) <= 12 && Math.abs(r - b) <= 12;
        const isBrightGrey = r >= 195 && g >= 195 && b >= 195;

        if (isNeutral && isBrightGrey) {
          this.data[idx + 3] = 0; // Make 100% transparent
          countRemoved++;
        }
      }
    }

    console.log(`Removed ${countRemoved} background pixels out of ${this.width * this.height}`);

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Successfully saved transparent PNG!');
    });
  });
