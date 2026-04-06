const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  
  // 192x192: target 172x172, border 10px
  await sharp(input)
    .resize(172, 172)
    .extend({ top: 10, bottom: 10, left: 10, right: 10, extendWith: 'copy' })
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // 512x512: target 460x460, border 26px
  await sharp(input)
    .resize(460, 460)
    .extend({ top: 26, bottom: 26, left: 26, right: 26, extendWith: 'copy' })
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // Apple touch icon (180x180): target 160x160, border 10px
  await sharp(input)
    .resize(160, 160)
    .extend({ top: 10, bottom: 10, left: 10, right: 10, extendWith: 'copy' })
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  console.log('✅ Icons regenerated (edge-copy version)!');
}

generateIcons().catch(console.error);
