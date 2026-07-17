import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const src = path.join(publicDir, 'images', 'logo-square.jpeg');

await sharp(src).resize(180, 180).png().toFile(path.join(publicDir, 'apple-icon.png'));
console.log('apple-icon.png');

await sharp(src).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
await sharp(src).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16.png'));
console.log('favicons');

const logoBuffer = await sharp(src).resize(200, 200).png().toBuffer();
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1e293b"/>
  <rect y="580" width="1200" height="50" fill="#2d3a4f"/>
  <text x="600" y="380" text-anchor="middle" font-family="Inter,sans-serif" font-size="56" font-weight="700" fill="#c6a667">Brick Health Energy</text>
  <text x="600" y="440" text-anchor="middle" font-family="Inter,sans-serif" font-size="22" fill="#94a3b8">Clean Energy for a Sustainable Future</text>
</svg>`;
const bg = Buffer.from(svg);

await sharp(bg)
  .composite([{ input: logoBuffer, left: 500, top: 70 }])
  .png()
  .toFile(path.join(publicDir, 'og-image.png'));
console.log('og-image.png');
