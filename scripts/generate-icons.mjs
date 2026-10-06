/**
 * Generate PWA icons from public/icons/source.svg (or SOURCE_ICON env path).
 *
 * Usage:
 *   node scripts/generate-icons.mjs
 *   SOURCE_ICON=./my-logo.png node scripts/generate-icons.mjs
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');
const sourcePath = process.env.SOURCE_ICON
  ? join(root, process.env.SOURCE_ICON)
  : join(outDir, 'source.svg');

if (!existsSync(sourcePath)) {
  console.error('Source icon not found:', sourcePath);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, 'public', 'screenshots'), { recursive: true });

const source = sharp(readFileSync(sourcePath)).ensureAlpha();

async function png(size, name, { maskable = false } = {}) {
  let pipeline = source.clone().resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

  if (maskable) {
    // Safe zone: content in center 80% with padded background
    const pad = Math.round(size * 0.1);
    const inner = size - pad * 2;
    const resized = await source
      .clone()
      .resize(inner, inner, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
      .png()
      .toBuffer();
    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 15, g: 23, b: 42, alpha: 1 }
      }
    }).composite([{ input: resized, top: pad, left: pad }]);
  }

  const dest = join(outDir, name);
  await pipeline.png().toFile(dest);
  console.log('wrote', dest);
}

async function screenshot(width, height, name) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <rect x="8%" y="12%" width="84%" height="76%" rx="24" fill="#1e293b"/>
      <text x="50%" y="48%" text-anchor="middle" fill="#38bdf8" font-family="system-ui,sans-serif" font-size="${Math.round(width / 18)}" font-weight="700">Dukaan Pro</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="${Math.round(width / 40)}">Replace this screenshot</text>
    </svg>`;
  const dest = join(root, 'public', 'screenshots', name);
  await sharp(Buffer.from(svg)).png().toFile(dest);
  console.log('wrote', dest);
}

await png(192, 'icon-192.png');
await png(512, 'icon-512.png');
await png(512, 'icon-512-maskable.png', { maskable: true });
await png(180, 'apple-touch-icon.png');
await png(32, 'favicon-32.png');
await png(16, 'favicon-16.png');

// favicon.ico as 32px png copy (browsers accept png via link; also write ico-like png)
await sharp(join(outDir, 'favicon-32.png')).toFile(join(root, 'public', 'favicon.ico'));

await screenshot(1280, 720, 'wide.png');
await screenshot(750, 1334, 'narrow.png');

// Shortcut icons (simple reuse)
for (const name of ['shortcut-sale.png', 'shortcut-customer.png', 'shortcut-inventory.png']) {
  await sharp(join(outDir, 'icon-192.png')).resize(96, 96).toFile(join(outDir, name));
  console.log('wrote', join(outDir, name));
}

console.log('Icons generated. Replace public/icons/source.svg (or set SOURCE_ICON) and re-run.');
