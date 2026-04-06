const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  
  // 192x192 icon (padded for circular masks, 134x134 inside 192x192)
  await sharp(input)
    .resize(134, 134, { fit: 'contain' })
    .extend({ top: 29, bottom: 29, left: 29, right: 29, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // 512x512 icon (padded for circular masks, 360x360 inside 512x512)
  await sharp(input)
    .resize(360, 360, { fit: 'contain' })
    .extend({ top: 76, bottom: 76, left: 76, right: 76, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // Apple touch icon (180x180, padded to 126x126 inside 180x180)
  await sharp(input)
    .resize(126, 126, { fit: 'contain' })
    .extend({ top: 27, bottom: 27, left: 27, right: 27, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  console.log('✅ Icons regenerated with extra padding for circular masks!');
}

generateIcons().catch(console.error);
