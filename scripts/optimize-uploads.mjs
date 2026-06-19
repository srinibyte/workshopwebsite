import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const uploadRoot = join(root, 'public', 'uploads');
const cachePath = join(uploadRoot, '.optimization-cache.json');
const maxWidth = Number(process.env.IMAGE_MAX_WIDTH || 2200);
const jpegQuality = Number(process.env.IMAGE_JPEG_QUALITY || 82);
const webpQuality = Number(process.env.IMAGE_WEBP_QUALITY || 82);
const pngQuality = Number(process.env.IMAGE_PNG_QUALITY || 82);
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const readCache = async () => {
	try {
		return JSON.parse(await readFile(cachePath, 'utf8'));
	} catch {
		return {};
	}
};

const writeCache = async (cache) => {
	await mkdir(dirname(cachePath), { recursive: true });
	await writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
};

const hashFile = async (filePath) =>
	createHash('sha256').update(await readFile(filePath)).digest('hex');

const walkImages = async (directory) => {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const entryPath = join(directory, entry.name);

			if (entry.isDirectory()) {
				return walkImages(entryPath);
			}

			if (!entry.isFile() || !supportedExtensions.has(extname(entry.name).toLowerCase())) {
				return [];
			}

			return [entryPath];
		})
	);

	return files.flat();
};

const optimizeImage = async (filePath, cache) => {
	const relativePath = relative(uploadRoot, filePath);
	const extension = extname(filePath).toLowerCase();
	const before = await stat(filePath);
	const beforeHash = await hashFile(filePath);
	const cacheKey = `${relativePath}:${maxWidth}:${jpegQuality}:${webpQuality}:${pngQuality}`;

	if (cache[cacheKey]?.hash === beforeHash) {
		return { status: 'cached', relativePath };
	}

	const metadata = await sharp(filePath).metadata();
	const shouldResize = metadata.width && metadata.width > maxWidth;
	const pipeline = sharp(filePath, { failOn: 'none' }).rotate();

	if (shouldResize) {
		pipeline.resize({ width: maxWidth, withoutEnlargement: true });
	}

	if (extension === '.jpg' || extension === '.jpeg') {
		pipeline.jpeg({ quality: jpegQuality, mozjpeg: true });
	} else if (extension === '.png') {
		pipeline.png({
			compressionLevel: 9,
			quality: pngQuality,
			palette: !metadata.hasAlpha
		});
	} else if (extension === '.webp') {
		pipeline.webp({ quality: webpQuality, effort: 5 });
	}

	const temporaryPath = `${filePath}.optimizing`;
	await pipeline.toFile(temporaryPath);

	const after = await stat(temporaryPath);

	if (after.size >= before.size) {
		await rm(temporaryPath, { force: true });
		cache[cacheKey] = { hash: beforeHash, bytes: before.size };
		return { status: 'kept', relativePath, before: before.size, after: after.size };
	}

	await rename(temporaryPath, filePath);
	const afterHash = await hashFile(filePath);
	cache[cacheKey] = { hash: afterHash, bytes: after.size };

	return { status: 'optimized', relativePath, before: before.size, after: after.size };
};

const formatBytes = (bytes) => `${Math.round(bytes / 1024)}KB`;

const main = async () => {
	const cache = await readCache();
	const images = await walkImages(uploadRoot);
	const results = [];

	for (const image of images) {
		results.push(await optimizeImage(image, cache));
	}

	await writeCache(cache);

	const optimized = results.filter((result) => result.status === 'optimized');
	const kept = results.filter((result) => result.status === 'kept');
	const cached = results.filter((result) => result.status === 'cached');

	for (const result of optimized) {
		console.log(
			`[images] optimized ${result.relativePath}: ${formatBytes(result.before)} -> ${formatBytes(result.after)}`
		);
	}

	console.log(
		`[images] ${optimized.length} optimized, ${kept.length} already smaller, ${cached.length} cached`
	);
};

main().catch((error) => {
	console.error('[images] optimization failed');
	console.error(error);
	process.exit(1);
});
