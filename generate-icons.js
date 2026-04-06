const sharp = require('sharp');
const path = require('path');

async function generateIcons() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  
  // 192x192 icon with white bg, logo width 168
  const logo192 = await sharp(input).resize(168, 168, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 192, height: 192, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
  .composite([{ input: logo192, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-192x192.png'));
  
  // 512x512 icon with white bg, logo width 450
  const logo512 = await sharp(input).resize(450, 450, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
  .composite([{ input: logo512, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'icon-512x512.png'));

  // 180x180 icon with white bg, logo width 156
  const logo180 = await sharp(input).resize(156, 156, { fit: 'inside' }).toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
  .composite([{ input: logo180, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));

  console.log('✅ Icons regenerated (perfect white bg banner)!');
}

generateIcons().catch(console.error);
