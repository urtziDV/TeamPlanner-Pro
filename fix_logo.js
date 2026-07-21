const { Jimp } = require('jimp');

async function fixLogo() {
  try {
    const image = await Jimp.read('logo.png');
    
    console.log('Original size:', image.bitmap.width, 'x', image.bitmap.height);
    
    // Crop all transparent borders
    image.autocrop();
    
    console.log('After autocrop:', image.bitmap.width, 'x', image.bitmap.height);
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // We want the logo to occupy almost all of the square, maybe 5% padding
    const size = Math.max(width, height);
    const paddedSize = Math.floor(size * 1.1); // 10% total padding (5% each side)
    
    const newImage = new Jimp({ width: paddedSize, height: paddedSize, color: 0x00000000 }); // transparent background
    
    const x = Math.floor((paddedSize - width) / 2);
    const y = Math.floor((paddedSize - height) / 2);
    
    newImage.composite(image, x, y);
    
    // Resize to a standard icon size like 512x512
    newImage.resize({ w: 512, h: 512 });
    
    await newImage.write('logo.png');
    console.log('Logo optimized and saved as 512x512 logo.png');
  } catch (err) {
    console.error(err);
  }
}

fixLogo();
