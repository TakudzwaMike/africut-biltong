import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { put, del } from '@vercel/blob';
import sharp from 'sharp';

const MAX_DISPLAY_WIDTH = 1920;
const MAX_THUMBNAIL_WIDTH = 400;

export async function load() {
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { mediaItems };
}

export const actions = {
	upload: async ({ request, locals }) => {
		const formData = await request.formData();
		const files = formData.getAll('images');
		
		for (const file of files) {
			if (!(file instanceof File) || file.size === 0) {
				continue; // Skip empty files
			}

			try {
				const buffer = Buffer.from(await file.arrayBuffer());

				// 1. Upload the original file FIRST
				const originalBlob = await put(file.name, buffer, { access: 'public' });

				// 2. Process with sharp
				const sharpInstance = sharp(buffer);
				const metadata = await sharpInstance.metadata();

				const displayBuffer = await sharpInstance.clone().resize({ width: MAX_DISPLAY_WIDTH, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
				const thumbnailBuffer = await sharpInstance.clone().resize({ width: MAX_THUMBNAIL_WIDTH, withoutEnlargement: true }).webp({ quality: 60 }).toBuffer();
				const blurBuffer = await sharpInstance.clone().resize(20).blur(1.5).webp({ quality: 50 }).toBuffer();
				const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

				// 3. Upload optimized versions
				const [displayBlob, thumbnailBlob] = await Promise.all([
					put(`display/${file.name}`, displayBuffer, { access: 'public', contentType: 'image/webp' }),
					put(`thumb/${file.name}`, thumbnailBuffer, { access: 'public', contentType: 'image/webp' })
				]);
				
				// 4. Delete the original now that we have optimized versions
				await del(originalBlob.url);
				
				// 5. Save to database
				const altText = file.name.split('.').slice(0, -1).join(' ');
				const [newMedia] = await db.insert(media).values({
					altText,
					originalUrl: originalBlob.url, // Still log original URL for reference
					width: metadata.width || 0,
					height: metadata.height || 0,
					displayUrl: displayBlob.url,
					thumbnailUrl: thumbnailBlob.url,
					blurDataUrl
				}).returning();
				
				await log(locals.user?.id, 'upload_media', { targetId: newMedia.id, data: newMedia });

			} catch (error) {
				console.error('Upload and processing failed for file:', file.name, error);
				return fail(500, { message: `Upload failed for ${file.name}` });
			}
		}

		return { success: true, message: 'Upload(s) complete.' };
	},

	delete: async ({ url, locals }) => {
		// ... delete logic remains the same
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });
		try {
			const mediaToDelete = await db.query.media.findFirst({ where: eq(media.id, Number(id)) });
			if (!mediaToDelete) return fail(404, { message: 'Media not found.' });
			
			await Promise.allSettled([
				del(mediaToDelete.originalUrl),
				mediaToDelete.displayUrl ? del(mediaToDelete.displayUrl) : Promise.resolve(),
				mediaToDelete.thumbnailUrl ? del(mediaToDelete.thumbnailUrl) : Promise.resolve()
			]);
			await db.delete(media).where(eq(media.id, Number(id)));
			await log(locals.user?.id, 'delete_media', { targetId: id, data: mediaToDelete });
			return { success: true, message: 'Media item deleted.' };
		} catch (error) {
			console.error('Error deleting media:', error);
			return fail(500, { message: 'Could not delete media item.' });
		}
	}
};