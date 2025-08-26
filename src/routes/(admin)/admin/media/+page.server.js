import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { mediaItems };
}

export const actions = {
	upload: async ({ request, locals }) => {
		const formData = await request.formData();
		const imageFile = formData.get('image');
		const altText = formData.get('altText');

		if (!(imageFile instanceof File) || imageFile.size === 0) {
			return fail(400, { message: 'Image file is required.' });
		}
		if (!altText || typeof altText !== 'string') {
			return fail(400, { message: 'Alt text is required for accessibility.' });
		}

		try {
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			const url = await uploadFile(buffer, imageFile.name, imageFile.type);

			const [newMedia] = await db
				.insert(media)
				.values({
					url,
					altText: String(altText)
				})
				.returning();

			await log(locals.user?.id, 'upload_media', {
				targetId: newMedia.id,
				data: newMedia
			});

			return { success: true, message: 'Image uploaded successfully!' };
		} catch (error) {
			console.error('Error uploading media:', error);
			return fail(500, { message: 'Could not upload the image.' });
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
			// A robust implementation would require a separate call to the blob storage API.
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
