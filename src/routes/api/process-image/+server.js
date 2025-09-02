import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';

const MAX_DISPLAY_WIDTH = 1920;
const MAX_THUMBNAIL_WIDTH = 400;

export async function POST({ request }) {
	// 1. Authenticate the request
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${env.IMAGE_PROCESSING_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { originalUrl, altText } = await request.json();
	if (!originalUrl || !altText) {
		return json({ error: 'Missing originalUrl or altText' }, { status: 400 });
	}

	try {
		// 2. Download the original image
		const imageResponse = await fetch(originalUrl);
		if (!imageResponse.ok) {
			throw new Error(`Failed to download original image: ${imageResponse.statusText}`);
		}
		const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

		// 3. Process the image with sharp
		const sharpInstance = sharp(imageBuffer);
		const metadata = await sharpInstance.metadata();
		const originalFilename = originalUrl.split('/').pop();

		// Create display version
		const displayBuffer = await sharpInstance
			.clone()
			.resize({ width: MAX_DISPLAY_WIDTH, withoutEnlargement: true })
			.webp({ quality: 80 })
			.toBuffer();

		// Create thumbnail version
		const thumbnailBuffer = await sharpInstance
			.clone()
			.resize({ width: MAX_THUMBNAIL_WIDTH, withoutEnlargement: true })
			.webp({ quality: 60 })
			.toBuffer();
			
		// Create blur placeholder
		const blurBuffer = await sharpInstance
			.clone()
			.resize({ width: 20 })
			.blur(1.5)
			.webp({ quality: 50 })
			.toBuffer();
		const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

		// 4. Upload new versions to Vercel Blob
		const [displayBlob, thumbnailBlob] = await Promise.all([
			put(`display/${originalFilename}`, displayBuffer, { access: 'public', contentType: 'image/webp' }),
			put(`thumb/${originalFilename}`, thumbnailBuffer, { access: 'public', contentType: 'image/webp' })
		]);

		// 5. Save all data to our database
		const [newMedia] = await db.insert(media).values({
			altText,
			originalUrl,
			width: metadata.width || 0,
			height: metadata.height || 0,
			displayUrl: displayBlob.url,
			thumbnailUrl: thumbnailBlob.url,
			blurDataUrl
		}).returning();

		// 6. (Optional but recommended) Delete the original unoptimized upload
		await del(originalUrl);

		return json({ success: true, media: newMedia });

	} catch (error) {
		console.error('Image processing failed:', error);
		return json({ error: 'Image processing failed' }, { status: 500 });
	}
}