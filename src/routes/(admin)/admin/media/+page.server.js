import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema.js';
import { fail, json } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { mediaItems };
}

export const actions = {
	// The client-side upload now triggers a separate processing endpoint.
	// This action is kept for progressive enhancement but is no longer the primary method.
	addReference: async () => {
		// The actual database insertion is now handled by /api/process-image
		// This action can be used as a fallback or for different upload strategies in the future.
		return json({ success: true, message: 'Upload initiated.' });
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const mediaToDelete = await db.query.media.findFirst({
				where: eq(media.id, Number(id))
			});

			if (!mediaToDelete) {
				return fail(404, { message: 'Media not found.' });
			}
			
			// Delete files from Vercel Blob storage.
			// We wrap this in a Promise.allSettled to ensure that even if one file fails to delete,
			// we still proceed with deleting the database record.
			await Promise.allSettled([
				mediaToDelete.originalUrl ? del(mediaToDelete.originalUrl) : Promise.resolve(),
				mediaToDelete.displayUrl ? del(mediaToDelete.displayUrl) : Promise.resolve(),
				mediaToDelete.thumbnailUrl ? del(mediaToDelete.thumbnailUrl) : Promise.resolve()
			]);

			await db.delete(media).where(eq(media.id, Number(id)));

			await log(locals.user?.id, 'delete_media', {
				targetId: id,
				data: mediaToDelete
			});

			return { success: true, message: 'Media item deleted.' };
		} catch (error) {
			console.error('Error deleting media:', error);
			return fail(500, { message: 'Could not delete the media item.' });
		}
	}
};