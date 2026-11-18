const fs = require('node:fs');
const sharp = require('sharp');
// Bake the original rotated rounded panel's blur into a reusable alpha mask.
// Coordinates are in em; 3x resolution keeps the small texture sharp on phones.
(async () => {
  fs.mkdirSync('public/images/skills', { recursive: true });
  for (const [name, size] of [['small', 2.6], ['large', 3]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 48}" height="${size * 48}" viewBox="0 0 ${size} ${size}"><defs><filter id="blur" x="-200%" y="-200%" width="500%" height="500%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0.75"/></filter></defs><g filter="url(#blur)"><rect width="${size}" height="${size}" rx="1.25" fill="white" transform="rotate(15 ${size} ${size})"/></g></svg>`;
    await sharp(Buffer.from(svg)).png().toFile(`public/images/skills/glass-${name}.png`);
  }
})();
