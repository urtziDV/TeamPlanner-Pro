const { Jimp } = require('jimp');
const { default: pngToIco } = require('png-to-ico');
const fs = require('fs');

async function generateIco() {
  try {
    // Read the already-optimized 512x512 logo.png
    const image = await Jimp.read('logo.png');
    
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];
    
    for (const size of sizes) {
      const resized = image.clone().resize({ w: size, h: size });
      const buffer = await resized.getBuffer('image/png');
      pngBuffers.push(buffer);
      console.log(`Generated ${size}x${size} layer`);
    }
    
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync('logo.ico', icoBuffer);
    console.log('logo.ico created successfully with sizes:', sizes.join(', '));
  } catch (err) {
    console.error(err);
  }
}

generateIco();
