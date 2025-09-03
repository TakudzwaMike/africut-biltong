import { db } from '$lib/server/db';
import { document, media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { uploadFile } from '$lib/server/blob';

export async function load() {
	const documents = await db.query.document.findMany({
		orderBy: desc(document.createdAt),
		with: {
			thumbnail: true
		}
	});
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { documents, mediaItems };
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const title = formData.get('title');
		const description = formData.get('description');
		const thumbnailMediaId = formData.get('thumbnailMediaId');
		const file = formData.get('file');

		if (!title || typeof title !== 'string') {
			return fail(400, { message: 'Title is required.' });
		}

		if (isNaN(id) && (!(file instanceof File) || file.size === 0)) {
			return fail(400, { message: 'A document file (e.g., PDF) is required.' });
		}

		try {
			const dataToSave = {
				title: String(title),
				description: String(description),
				thumbnailMediaId: thumbnailMediaId ? Number(thumbnailMediaId) : null
			};

			if (file instanceof File && file.size > 0) {
				const buffer = Buffer.from(await file.arrayBuffer());
				dataToSave.fileUrl = await uploadFile(buffer, file.name, file.type);
			}

			if (isNaN(id)) {
				const [newDoc] = await db.insert(document).values(dataToSave).returning();
				await log(locals.user?.id, 'create_document', {
					targetId: newDoc.id,
					data: newDoc
				});
			} else {
				await db.update(document).set(dataToSave).where(eq(document.id, id));
				await log(locals.user?.id, 'update_document', { targetId: id, data: dataToSave });
			}
			return { success: true, message: 'Document saved successfully.' };
		} catch (error) {
			console.error('Error saving document:', error);
			return fail(500, { message: 'Could not save the document.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const docToDelete = await db.query.document.findFirst({
				where: eq(document.id, Number(id))
			});
			if (!docToDelete) {
				return fail(404, { message: 'Document not found.' });
			}
			// Note: This does not delete the file from Blob storage.
			await db.delete(document).where(eq(document.id, Number(id)));

			await log(locals.user?.id, 'delete_document', {
				targetId: id,
				data: docToDelete
			});
			
			return { success: true, message: 'Document deleted successfully.' };
		} catch (error) {
			console.error('Error deleting document:', error);
			return fail(500, { message: 'Could not delete the document.' });
		}
	}
};