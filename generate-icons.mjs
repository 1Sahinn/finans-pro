import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcImg = 'C:\\Users\\Monster Notebook\\.gemini\\antigravity-ide\\brain\\fb57be31-5a0e-46d4-91a4-a86398b682f8\\finanspro_icon_1791295200171.png';

const outDir = join(__dirname, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(srcImg)
    .resize(size, size)
    .png()
    .toFile(join(outDir, `icon-${size}x${size}.png`));
  console.log(`Generated icon-${size}x${size}.png`);
}

// Apple touch icon
await sharp(srcImg).resize(180, 180).png().toFile(join(__dirname, 'public', 'apple-touch-icon.png'));

// Favicon (32x32)
await sharp(srcImg).resize(32, 32).png().toFile(join(__dirname, 'public', 'favicon.png'));

console.log('All icons generated!');
