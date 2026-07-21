const Jimp = require('jimp');

async function padLogo() {
  try {
    const image = await Jimp.read('logo.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const size = Math.max(width, height);
    
    const newImage = new Jimp(size, size, 0x00000000); // Transparent background
    
    const x = Math.floor((size - width) / 2);
    const y = Math.floor((size - height) / 2);
    
    newImage.composite(image, x, y);
    await newImage.writeAsync('logo.png');
    console.log('Logo padded to', size, 'x', size);
  } catch (err) {
    console.error(err);
  }
}

padLogo();
