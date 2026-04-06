const sharp = require('sharp');
const path = require('path');

async function simulate() {
  const input = path.join(__dirname, 'public', 'icon-512x512.png');
  
  // Create a circular SVG mask
  const circleSvg = Buffer.from(
    `<svg width="512" height="512">
      <circle cx="256" cy="256" r="256" fill="white"/>
    </svg>`
  );

  await sharp(input)
    .composite([{
      input: circleSvg,
      blend: 'dest-in' // Keeps only the parts of the image that overlap with the mask
    }])
    .png()
    .toFile(path.join(__dirname, 'icon_preview_circle.png'));

  // Also simulate iOS squircle
  const squircleSvg = Buffer.from(
    `<svg width="512" height="512">
      <rect x="0" y="0" width="512" height="512" rx="115" ry="115" fill="white"/>
    </svg>`
  );

  await sharp(input)
    .composite([{
      input: squircleSvg,
      blend: 'dest-in'
    }])
    .png()
    .toFile(path.join(__dirname, 'icon_preview_squircle.png'));

  console.log('Simulation complete');
}

simulate().catch(console.error);
