// Resize the corrected, full-bleed artwork. The OS supplies the corner mask.
const path = require('node:path');
const sharp = require('sharp');
const directory = path.join(__dirname, '../wetasks/icons');
Promise.all([180, 192, 512].map(size => sharp(path.join(directory, 'wetasks-full-bleed.png'))
  .resize(size, size)
  .png()
  .toFile(path.join(directory, `wetasks-${size}-v2.png`))))
  .catch(error => { console.error(error); process.exitCode = 1; });
