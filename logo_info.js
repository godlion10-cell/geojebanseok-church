const sharp = require('sharp');
const path = require('path');

async function info() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  const metadata = await sharp(input).metadata();
  console.log('metadata:', metadata);
  // get a few pixels from corners
  const buf1 = await sharp(input).extract({left:0, top:0, width:1, height:1}).raw().toBuffer();
  console.log('0,0 RGB:', buf1[0], buf1[1], buf1[2], 'Alpha:', buf1[3]);
}
info().catch(console.error);
