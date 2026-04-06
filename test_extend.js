const sharp = require('sharp');
const path = require('path');

async function testSharp() {
  const input = path.join(__dirname, 'public', 'church-logo.png');
  await sharp(input)
    .extend({ top: 30, bottom: 30, left: 30, right: 30, extendWith: 'copy' })
    .toFile(path.join(__dirname, 'test_extend.png'));
  console.log("Success");
}

testSharp().catch(console.error);
