// Packaging only: resize the supplied artwork, without changing its design.
const path = require('node:path');
const sharp = require('sharp');
const directory = path.join(__dirname, '../wetasks/icons');
Promise.all([180, 192, 512].map(size => sharp(path.join(directory, 'wetasks.jpeg'))
  .resize(size, size)
  .png()
  .toFile(path.join(directory, `wetasks-${size}.png`))))
  .catch(error => { console.error(error); process.exitCode = 1; });
