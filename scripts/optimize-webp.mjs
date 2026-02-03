import sharp from 'sharp';
import { readdir, stat, copyFile } from 'fs/promises';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const inputDir = join(__dirname, '../public/images');
const outputDir = join(__dirname, '../public/images-optimized');

import { mkdir } from 'fs/promises';

async function optimizeImages() {
  try {
    await mkdir(outputDir, { recursive: true });
  } catch {}

  const files = await readdir(inputDir);
  const webpFiles = files.filter(f => f.toLowerCase().endsWith('.webp'));

  console.log(`Found ${webpFiles.length} WebP files to optimize`);
  console.log(`Output directory: ${outputDir}\n`);

  let totalSaved = 0;
  let processed = 0;

  for (const file of webpFiles) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);

    try {
      const originalStats = await stat(inputPath);
      const originalSize = originalStats.size;

      // Hero image gets special treatment - still high quality but more compression
      const isHero = file === 'hero.webp';
      const quality = isHero ? 65 : 60;

      // Max width: hero=1920, others=1600
      const maxWidth = isHero ? 1920 : 1600;

      const metadata = await sharp(inputPath).metadata();

      let pipeline = sharp(inputPath);

      if (metadata.width && metadata.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, { withoutEnlargement: true });
      }

      await pipeline
        .webp({ quality, effort: 6 })
        .toFile(outputPath);

      const newStats = await stat(outputPath);
      const newSize = newStats.size;
      const saved = originalSize - newSize;

      if (saved > 0) {
        totalSaved += saved;
        console.log(`✓ ${file}: ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB (saved ${(saved/1024).toFixed(0)}KB)`);
        processed++;
      } else {
        console.log(`- ${file}: already optimal (${(originalSize/1024).toFixed(0)}KB)`);
      }
    } catch (err) {
      console.error(`✗ Failed to optimize ${file}:`, err.message);
    }
  }

  console.log(`\nProcessed: ${processed} files`);
  console.log(`Total saved: ${(totalSaved/1024/1024).toFixed(2)}MB`);
  console.log(`\nOptimized images are in: ${outputDir}`);
  console.log('To apply: copy files from images-optimized/ to images/');
}

optimizeImages().catch(console.error);
