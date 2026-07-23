/**
 * scripts/icon-master.svg から PWA/ファビコン用のPNGを生成する。
 * 使用: node scripts/generate-icons.mjs
 * sharp が必要（devDependency）。
 */
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const svgPath = join(here, 'icon-master.svg');
const outDir = join(here, '..', 'public', 'icons');

const targets = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'maskable-192.png', size: 192, pad: true },
  { name: 'maskable-512.png', size: 512, pad: true },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
];

const svg = await readFile(svgPath);
await mkdir(outDir, { recursive: true });

for (const t of targets) {
  let pipeline = sharp(svg, { density: 384 });
  if (t.pad) {
    // maskable用にセーフゾーンを確保（周囲に余白を追加）
    const inner = Math.round(t.size * 0.78);
    const bg = { r: 28, g: 28, b: 30, alpha: 1 };
    const resized = await sharp(svg, { density: 384 })
      .resize(inner, inner)
      .png()
      .toBuffer();
    pipeline = sharp({
      create: { width: t.size, height: t.size, channels: 4, background: bg },
    }).composite([{ input: resized, gravity: 'centre' }]);
  } else {
    pipeline = pipeline.resize(t.size, t.size);
  }
  await pipeline.png().toFile(join(outDir, t.name));
  console.log(`✓ ${t.name} (${t.size}px)`);
}

console.log('アイコン生成完了');
