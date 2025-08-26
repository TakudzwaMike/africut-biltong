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
	// This action is called AFTER the file has been uploaded to Vercel Blob on the client.
	// Its job is to save the reference to our database.
	addReference: async ({ request, locals }) => {
		const formData = await request.formData();
		const url = formData.get('url');
		const altText = formData.get('altText');

		if (!url || typeof url !== 'string' || !altText || typeof altText !== 'string') {
			return json({ success: false, message: 'URL and Alt Text are required.' }, { status: 400 });
		}

		try {
			const [newMedia] = await db.insert(media).values({ url, altText }).returning();

			await log(locals.user?.id, 'upload_media', {
				targetId: newMedia.id,
				data: newMedia
			});
			
			// Return the new media item so the client can update instantly
			return json({ success: true, newMedia });

		} catch (error) {
			console.error('Error saving media reference:', error);
			return json({ success: false, message: 'Could not save media reference to the database.' }, { status: 500 });
		}
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
			// Note: This does not delete the file from Vercel Blob storage.
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