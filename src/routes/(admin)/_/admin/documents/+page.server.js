import { db } from '$lib/server/db';
import { document, media } from '$lib/server/db/schema.js';
import { fail, error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage documents.');
	}

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
	create: async ({ request, locals }) => {
		// 2. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const title = formData.get('title');
		const description = formData.get('description');
		const thumbnailMediaIdRaw = formData.get('thumbnailMediaId');
		const isGated = formData.get('isGated') === 'on';
		const fileUrl = formData.get('fileUrl');

		if (!title || typeof title !== 'string') {
			return fail(400, { message: 'Title is required.' });
		}
		if (!fileUrl) {
			return fail(400, { message: 'A document file must be uploaded.' });
		}

		try {
			const parsedMediaId = thumbnailMediaIdRaw ? parseInt(String(thumbnailMediaIdRaw), 10) : NaN;

			const dataToSave = {
				title: String(title),
				description: String(description),
				thumbnailMediaId: !isNaN(parsedMediaId) ? parsedMediaId : null,
				isGated: isGated,
				fileUrl: String(fileUrl)
			};

			const [newDoc] = await db.insert(document).values(dataToSave).returning();
			await log(locals.user?.id, 'create_document', { targetId: newDoc.id, data: newDoc });

			return { success: true, message: 'Document created successfully.' };
		} catch (error) {
			console.error('Error creating document:', error);
			return fail(500, { message: 'Could not create document.' });
		}
	},

	update: async ({ request, locals }) => {
		// 3. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const title = formData.get('title');
		const description = formData.get('description');
		const thumbnailMediaIdRaw = formData.get('thumbnailMediaId');
		const isGated = formData.get('isGated') === 'on';
		const fileUrl = formData.get('fileUrl');

		if (isNaN(id)) {
			return fail(400, { message: 'Invalid ID.' });
		}
		if (!title || typeof title !== 'string') {
			return fail(400, { message: 'Title is required.' });
		}

		try {
			const parsedMediaId = thumbnailMediaIdRaw ? parseInt(String(thumbnailMediaIdRaw), 10) : NaN;

			const dataToUpdate = {
				title: String(title),
				description: String(description),
				thumbnailMediaId: !isNaN(parsedMediaId) ? parsedMediaId : null,
				isGated: isGated
			};

			if (fileUrl) {
				dataToUpdate.fileUrl = String(fileUrl);
			}

			await db.update(document).set(dataToUpdate).where(eq(document.id, id));
			await log(locals.user?.id, 'update_document', { targetId: id, data: dataToUpdate });

			return { success: true, message: 'Document updated successfully.' };
		} catch (error) {
			console.error('Error updating document:', error);
			return fail(500, { message: 'Could not update document.' });
		}
	},

	delete: async ({ url, locals }) => {
		// 4. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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
			
			await db.delete(document).where(eq(document.id, Number(id)));
			await log(locals.user?.id, 'delete_document', { targetId: id, data: docToDelete });
			
			return { success: true, message: 'Document deleted successfully.' };
		} catch (error) {
			console.error('Error deleting document:', error);
			return fail(500, { message: 'Could not delete the document.' });
		}
	}
};