const sharp = require('sharp');
const path = require('path');

async function debugCrop() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  const metadata = await sharp(input).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Crop left 40%, middle 40-70%, right 70-100% to find text
  await sharp(input).extract({ left: 0, top: 0, width: Math.floor(width * 0.5), height }).resize(800).toFile('crop_left.png');
  await sharp(input).extract({ left: Math.floor(width * 0.5), top: 0, width: Math.floor(width * 0.5), height }).resize(800).toFile('crop_right.png');
  
  console.log('Crops generated');
}

debugCrop().catch(console.error);
