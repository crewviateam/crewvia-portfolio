/**
 * Image Optimization Script
 * Converts public/image assets to WebP with optimal compression.
 * Run once: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public/image');

// Ensure output directory exists
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const tasks = [
  {
    input:   resolve(publicDir, 'hero_bg.jpg'),
    output:  resolve(publicDir, 'hero_bg.webp'),
    options: {
      width:   1920,   // Max display width (full-width hero section)
      quality: 72,     // Sweet spot: visually lossless, minimal size
      effort:  6,      // Encoding effort 0-6 (6 = smallest file, slower encode)
    },
    label: 'Hero Background'
  },
  {
    input:   resolve(publicDir, 'LOGO PNG.png'),
    output:  resolve(publicDir, 'logo.webp'),
    options: {
      width:   400,    // Max rendered logo size (2x for HiDPI)
      quality: 90,     // Higher quality for logo (sharp edges, brand critical)
      effort:  6,
      lossless: false,
    },
    label: 'Logo'
  },
];

async function run() {
  console.log('🖼  Starting image optimization...\n');

  for (const task of tasks) {
    if (!existsSync(task.input)) {
      console.warn(`⚠  Skipping "${task.label}" — input not found: ${task.input}`);
      continue;
    }

    const { width, quality, effort, lossless } = task.options;

    const inputMeta = await sharp(task.input).metadata();
    const inputSizeKB = Math.round((await sharp(task.input).toBuffer()).length / 1024);

    await sharp(task.input)
      .resize({ width, withoutEnlargement: true }) // Never upscale
      .webp({ quality, effort, lossless: lossless ?? false })
      .toFile(task.output);

    const outputSizeKB = Math.round((await sharp(task.output).toBuffer()).length / 1024);
    const saving = Math.round((1 - outputSizeKB / inputSizeKB) * 100);

    console.log(`✅ ${task.label}`);
    console.log(`   Input:  ${task.input.split('/').pop()} — ${inputSizeKB} KB (${inputMeta.width}x${inputMeta.height} ${inputMeta.format})`);
    console.log(`   Output: ${task.output.split('/').pop()} — ${outputSizeKB} KB (WebP)`);
    console.log(`   Saved:  ${saving}% reduction\n`);
  }

  console.log('🚀 Done. Update image src paths in components to use .webp files.');
}

run().catch(err => {
  console.error('Error during optimization:', err);
  process.exit(1);
});
