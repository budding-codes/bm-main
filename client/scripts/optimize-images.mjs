import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, parse, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '..', 'assets');
const OUT_DIR = join(ASSETS_DIR, 'optimized');

/** Images to optimize with max widths (mobile, desktop) */
const PRIORITY = [
  { file: 'BG Header.png', widths: [640, 1024, 1920], quality: 78 },
  { file: 'compass.png', widths: [220, 440], quality: 82 },
  { file: 'highestselections.png', widths: [320], quality: 80 },
  { file: 'Selection.png', widths: [320], quality: 80 },
  { file: 'mocktest.png', widths: [320], quality: 80 },
  { file: 'S1.jpg', widths: [400], quality: 80 },
  { file: 'S2.jpg', widths: [400], quality: 80 },
  { file: 'S3.jpg', widths: [400], quality: 80 },
  { file: 'S4.png', widths: [400], quality: 80 },
  { file: 'S5.png', widths: [400], quality: 80 },
  { file: 'S6.png', widths: [400], quality: 80 },
  { file: 'S7.png', widths: [400], quality: 80 },
  { file: 'S8.png', widths: [400], quality: 80 },
  { file: 'S9.png', widths: [400], quality: 80 },
  { file: 'our story.jpg', widths: [800, 1400], quality: 80 },
  { file: 'roadmap.png', widths: [800, 1400], quality: 80 },
  { file: 'yellow on orange logomark.png', widths: [120, 240], quality: 85 },
];

async function optimizeEntry({ file, widths, quality }) {
  const input = join(ASSETS_DIR, file);
  const base = parse(file).name;
  const results = [];

  for (const width of widths) {
    const suffix = widths.length > 1 ? `-${width}w` : '';
    const outWebp = join(OUT_DIR, `${base}${suffix}.webp`);
    const outAvif = join(OUT_DIR, `${base}${suffix}.avif`);

    const pipeline = sharp(input).resize({ width, withoutEnlargement: true });

    await pipeline.clone().webp({ quality, effort: 6 }).toFile(outWebp);
    await pipeline.clone().avif({ quality: quality - 5, effort: 6 }).toFile(outAvif);

    const webpStat = await stat(outWebp);
    const inputStat = await stat(input);
    results.push({
      file: relative(ASSETS_DIR, outWebp),
      width,
      sizeKB: Math.round(webpStat.size / 1024),
      savedFromKB: Math.round(inputStat.size / 1024),
    });
  }

  return results;
}

await mkdir(OUT_DIR, { recursive: true });

console.log('Optimizing priority images...\n');
let totalSaved = 0;

for (const entry of PRIORITY) {
  try {
    const inputStat = await stat(join(ASSETS_DIR, entry.file));
    const before = Math.round(inputStat.size / 1024);
    const results = await optimizeEntry(entry);
    const after = results.reduce((sum, r) => sum + r.sizeKB, 0);
    totalSaved += before - Math.min(...results.map((r) => r.sizeKB));
    console.log(`${entry.file}: ${before} KB -> ${results.map((r) => `${r.sizeKB} KB (${r.width}w)`).join(', ')}`);
  } catch (err) {
    console.error(`Failed: ${entry.file}`, err.message);
  }
}

// Optimize remaining PNG/JPG in assets root (moderate compression)
const allFiles = await readdir(ASSETS_DIR);
const skip = new Set(PRIORITY.map((p) => p.file));
const CL_PATTERN = /^CL\d+/;

for (const file of allFiles) {
  if (skip.has(file) || !/\.(png|jpe?g)$/i.test(file)) continue;
  if (CL_PATTERN.test(file)) {
    // Company logos - small webp only
    const input = join(ASSETS_DIR, file);
    const base = parse(file).name;
    const outWebp = join(OUT_DIR, `${base}.webp`);
    await sharp(input).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(outWebp);
    const s = await stat(outWebp);
    console.log(`${file} -> ${Math.round(s.size / 1024)} KB webp`);
  }
}

console.log(`\nDone. Output: assets/optimized/`);
