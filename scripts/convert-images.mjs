import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const inputDir = join(__dirname, '../public/images');
const outputDir = inputDir;

async function convertImages() {
  const files = await readdir(inputDir);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files to convert`);

  for (const file of pngFiles) {
    const inputPath = join(inputDir, file);
    const { name } = parse(file);
    const outputPath = join(outputDir, `${name}.webp`);

    try {
      const metadata = await sharp(inputPath).metadata();

      // Resize if too large (max 1920px width for most images)
      let pipeline = sharp(inputPath);

      if (metadata.width > 1920) {
        pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
      }

      await pipeline
        .webp({ quality: 80 })
        .toFile(outputPath);

      const inputStats = await sharp(inputPath).metadata();
      const outputStats = await sharp(outputPath).metadata();

      console.log(`✓ ${file} → ${name}.webp`);
    } catch (err) {
      console.error(`✗ Failed to convert ${file}:`, err.message);
    }
  }

  console.log('\nConversion complete!');
}

convertImages().catch(console.error);
