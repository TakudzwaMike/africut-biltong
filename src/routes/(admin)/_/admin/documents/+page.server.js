import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { DocumentService } from '$lib/server/services/DocumentService';
import { MediaService } from '$lib/server/services/MediaService';


const documentService = new DocumentService();
const mediaService = new MediaService();
const ITEMS_PER_PAGE = 20;

export async function load({ url, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage documents.');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';

	const [{ documents, totalItems, totalPages }, mediaItems] = await Promise.all([
		documentService.listDocuments({
			page,
			limit: ITEMS_PER_PAGE,
			query
		}),
		mediaService.listMedia()
	]);

	return {
		documents,
		mediaItems,
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const title = String(formData.get('title'));
		const category = String(formData.get('category'));
		const fileUrl = String(formData.get('fileUrl'));
		const description = String(formData.get('description'));
		const thumbnailMediaIdRaw = formData.get('thumbnailMediaId');
		const isGated = formData.get('isGated') === 'on';

		if (!title || typeof title !== 'string') {
			return fail(400, { message: 'Title is required.' });
		}
		if (!fileUrl) {
			return fail(400, { message: 'A document file must be uploaded.' });
		}

		try {
			const parsedMediaId = thumbnailMediaIdRaw ? parseInt(String(thumbnailMediaIdRaw), 10) : NaN;

			const doc = await documentService.createDocument(locals.user.id, {
				title,
				fileUrl,
				description,
				thumbnailMediaId: !isNaN(parsedMediaId) ? parsedMediaId : null,
				isGated: isGated
			});

			await log(locals.user.id, 'create_document', { targetId: doc.id, data: { title } });
			return { success: true, message: 'Document created successfully.' };
		} catch (err) {
			return fail(500, { message: 'Failed to create document.' });
		}
	},

	update: async ({ request, locals }) => {
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

		if (isNaN(id)) return fail(400, { message: 'Invalid ID.' });
		if (!title || typeof title !== 'string') return fail(400, { message: 'Title is required.' });

		try {
			const parsedMediaId = thumbnailMediaIdRaw ? parseInt(String(thumbnailMediaIdRaw), 10) : NaN;

			const dataToUpdate = {
				title: String(title),
				description: String(description),
				thumbnailMediaId: !isNaN(parsedMediaId) ? parsedMediaId : null,
				isGated: isGated,
				fileUrl: fileUrl ? String(fileUrl) : undefined
			};

			await documentService.updateDocument(locals.user.id, id, dataToUpdate);
			await log(locals.user?.id, 'update_document', { targetId: id, data: dataToUpdate });

			return { success: true, message: 'Document updated successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not update document.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			// Note: deleteDocument in service currently returns void, assuming success if no error
			// If we want to return 404, service needs to throw or return boolean.
			// For now, we assume if it throws it failed, if not it succeeded.
			// The service method just calls repo.delete.
			await documentService.deleteDocument(locals.user.id, Number(id));

			await log(locals.user?.id, 'delete_document', { targetId: id });

			return { success: true, message: 'Document deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the document.' });
		}
	}
};