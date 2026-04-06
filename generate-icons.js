const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  
  // Create 192x192 icon with 134x134 inner logo
  const logo192 = await sharp(input).resize(134, 134, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 192, height: 192, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo192, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // Create 512x512 icon with 360x360 inner logo
  const logo512 = await sharp(input).resize(360, 360, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo512, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // Create Apple touch icon (180x180) with 126x126 inner logo
  const logo180 = await sharp(input).resize(126, 126, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([{ input: logo180, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  console.log('✅ Icons regenerated with proper white padding!');
}

generateIcons().catch(console.error);
