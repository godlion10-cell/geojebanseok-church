const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'logo-stacked.svg');
  
  // Create 192x192
  await sharp(input)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // Create 512x512
  await sharp(input)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // Create Apple touch icon (180x180)
  await sharp(input)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  // Generate proof (simulate circle)
  const circleSvg = Buffer.from(
    `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="white"/></svg>`
  );
  await sharp(path.join(__dirname, 'public', 'icon-512x512.png'))
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toFile(path.join(__dirname, 'proof_circle.png'));

  console.log('✅ Icons regenerated with stacked design!');
}

generateIcons().catch(console.error);
