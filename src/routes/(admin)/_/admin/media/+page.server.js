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

		if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
			return fail(400, { message: 'No files were selected for upload.' });
		}

		const uploadPromises = files.map(async (file) => {
			if (!(file instanceof File) || file.size === 0) {
				return { status: 'skipped', name: 'empty file' };
			}

			try {
				const buffer = Buffer.from(await file.arrayBuffer());

				const originalBlob = await put(file.name, buffer, { access: 'public' });

				const sharpInstance = sharp(buffer);
				const metadata = await sharpInstance.metadata();

				const displayBuffer = await sharpInstance
					.clone()
					.resize({ width: MAX_DISPLAY_WIDTH, withoutEnlargement: true })
					.webp({ quality: 80 })
					.toBuffer();
				const thumbnailBuffer = await sharpInstance
					.clone()
					.resize({ width: MAX_THUMBNAIL_WIDTH, withoutEnlargement: true })
					.webp({ quality: 60 })
					.toBuffer();
				const blurBuffer = await sharpInstance
					.clone()
					.resize(20)
					.blur(1.5)
					.webp({ quality: 50 })
					.toBuffer();
				const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

				const [displayBlob, thumbnailBlob] = await Promise.all([
					put(`display/${file.name}`, displayBuffer, { access: 'public', contentType: 'image/webp' }),
					put(`thumb/${file.name}`, thumbnailBuffer, { access: 'public', contentType: 'image/webp' })
				]);

				await del(originalBlob.url);

				const altText = file.name.split('.').slice(0, -1).join(' ');
				const [newMedia] = await db
					.insert(media)
					.values({
						altText,
						originalUrl: originalBlob.url,
						width: metadata.width || 0,
						height: metadata.height || 0,
						displayUrl: displayBlob.url,
						thumbnailUrl: thumbnailBlob.url,
						blurDataUrl
					})
					.returning();

				await log(locals.user?.id, 'upload_media', { targetId: newMedia.id, data: newMedia });
				return { status: 'fulfilled', name: file.name };
			} catch (error) {
				console.error(`Upload and processing failed for file: ${file.name}`, error);
				return { status: 'rejected', name: file.name, reason: error.message };
			}
		});

		const results = await Promise.allSettled(uploadPromises);
		
		const successfulUploads = results.filter(r => r.status === 'fulfilled' && r.value.status === 'fulfilled');
		const failedUploads = results.filter(r => r.status === 'rejected' || r.value.status === 'rejected');

		if (failedUploads.length > 0) {
			const failedNames = failedUploads.map(r => r.status === 'fulfilled' ? r.value.name : 'a file').join(', ');
			if (successfulUploads.length > 0) {
				return fail(500, { message: `Successfully uploaded ${successfulUploads.length} image(s), but failed on: ${failedNames}.` });
			} else {
				return fail(500, { message: `All uploads failed. Please check file sizes and formats.` });
			}
		}

		return { success: true, message: `Successfully uploaded ${successfulUploads.length} image(s).` };
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });
		try {
			const mediaToDelete = await db.query.media.findFirst({ where: eq(media.id, Number(id)) });
			if (!mediaToDelete) return fail(404, { message: 'Media not found.' });

			await Promise.allSettled([
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
