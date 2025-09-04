import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// --- CONFIGURATION ---
const MAX_WIDTH = 1920; // Max width for display images
const WEBP_QUALITY = 80; // Quality setting for WebP images (1-100)
// -------------------

async function compressImage(inputPath, outputPath) {
	try {
		const imageBuffer = await fs.readFile(inputPath);
		await sharp(imageBuffer)
			.resize({
				width: MAX_WIDTH,
				withoutEnlargement: true // Don't scale up smaller images
			})
			.webp({ quality: WEBP_QUALITY })
			.toFile(outputPath);
		
		console.log(`✅ Compressed: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
	} catch (error) {
		console.error(`❌ Failed to compress ${path.basename(inputPath)}:`, error);
	}
}

async function main() {
	const [,, inputDir, outputDir] = process.argv;

	if (!inputDir || !outputDir) {
		console.error('\nUsage: npm run compress:images -- <input_directory> <output_directory>\n');
		console.error('Example: npm run compress:images -- ./originals ./compressed\n');
		process.exit(1);
	}
	
	console.log(`Watching for images in: ${inputDir}`);
	console.log(`Outputting compressed images to: ${outputDir}\n`);

	try {
		await fs.access(inputDir);
	} catch (e) {
		console.error(`Error: Input directory "${inputDir}" does not exist.`);
		process.exit(1);
	}

	await fs.mkdir(outputDir, { recursive: true });

	const files = await fs.readdir(inputDir);
	const imageExtensions = /\.(jpg|jpeg|png|webp)$/i;

	for (const file of files) {
		if (imageExtensions.test(file)) {
			const inputPath = path.join(inputDir, file);
			const { name } = path.parse(file);
			const outputPath = path.join(outputDir, `${name}.webp`);
			await compressImage(inputPath, outputPath);
		}
	}

	console.log('\nCompression run complete.');
}

main();