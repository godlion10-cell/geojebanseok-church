const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  
  // 192x192 icon with ~85% inner size (160x160) to keep it big but not clip corners
  const logo192 = await sharp(input).resize(162, 162, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo192, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // 512x512 icon with ~85% inner size (435x435)
  const logo512 = await sharp(input).resize(435, 435, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo512, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // Apple touch icon (180x180) with ~85% inner size (153x153)
  const logo180 = await sharp(input).resize(153, 153, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo180, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  console.log('✅ Icons regenerated (larger text version)!');
}

generateIcons().catch(console.error);
