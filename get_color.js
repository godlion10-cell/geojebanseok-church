const sharp = require('sharp');
const path = require('path');

async function checkColor() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  const buffer = await sharp(input).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  console.log(`RGB: ${buffer[0]}, ${buffer[1]}, ${buffer[2]}`);
}

checkColor().catch(console.error);
