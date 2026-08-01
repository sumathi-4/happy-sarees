const fs = require('fs');
const { PNG } = require('pngjs');

const inputPath = "C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\6702231e-5a58-45b9-ab80-5dc05ac58a8f\\.user_uploaded\\media__1785539729432.png";
const outputPath = "c:\\Users\\ELCOT\\OneDrive\\Desktop\\job tasks\\happy sarees\\user\\public\\images\\why_choose_us_models.png";

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    console.log(`Image dimensions: ${this.width} x ${this.height}`);

    // Sample top-left pixel background color
    const idx0 = 0;
    const bgR = this.data[idx0];
    const bgG = this.data[idx0 + 1];
    const bgB = this.data[idx0 + 2];
    console.log(`Sample background RGB at (0,0): R=${bgR}, G=${bgG}, B=${bgB}`);

    let transparentCount = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        // Check distance to light grey background color (around 225-240)
        // Background in image is uniform light grey/off-white #e3e3e3 to #e9e9e9
        const isGreyBg = (
          (r >= 210 && r <= 245) &&
          (g >= 210 && g <= 245) &&
          (b >= 210 && b <= 245) &&
          Math.abs(r - g) < 15 &&
          Math.abs(g - b) < 15 &&
          Math.abs(r - b) < 15
        );

        if (isGreyBg) {
          // Soft edge feathering
          const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
          if (diff < 15) {
            this.data[idx + 3] = 0; // Fully transparent
          } else {
            // Feather edge
            const alpha = Math.min(255, Math.max(0, Math.floor((diff - 10) * 15)));
            this.data[idx + 3] = alpha;
          }
          transparentCount++;
        }
      }
    }

    console.log(`Made ${transparentCount} background pixels transparent out of ${this.width * this.height}`);

    this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Saved transparent PNG to:', outputPath);
    });
  });
