import { fail } from '@sveltejs/kit';
import { MediaService } from '$lib/server/services/MediaService';
import { log } from '$lib/server/auditLog';

const mediaService = new MediaService();
const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';
	const type = url.searchParams.get('type') || 'all';

	const { media, totalItems, totalPages } = await mediaService.listMedia({
		page,
		limit: ITEMS_PER_PAGE,
		query,
		type
	});

	return {
		media,
		pagination: {
			page,
			totalPages,
			totalItems,
			query,
			type
		}
	};
}

export const actions = {
	upload: async ({ request, locals }) => {
		const formData = await request.formData();
		const files = formData.getAll('images');

		if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
			return fail(400, { message: 'No files were selected for upload.' });
		}

		let successfulUploads = 0;
		let failedUploads = 0;

		for (const file of files) {
			try {
				const media = await mediaService.createMedia(locals.user.id, {
					file,
					altText: file.name,
					type: file.type.startsWith('image/') ? 'image' : 'document'
				});
				await log(locals.user.id, 'upload_media', { targetId: media.id });
				successfulUploads++;
			} catch (err) {
				console.error('Upload failed for file:', file.name, err);
				failedUploads++;
			}
		}

		if (failedUploads > 0 && successfulUploads === 0) {
			return fail(500, { message: 'All file uploads failed.' });
		} else if (failedUploads > 0) {
			return { success: true, message: `${successfulUploads} files uploaded, ${failedUploads} failed.` };
		}

		return { success: true, message: 'All files uploaded successfully.' };
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id'));

		try {
			await mediaService.deleteMedia(locals.user.id, id);
			await log(locals.user.id, 'delete_media', { targetId: id });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to delete media' });
		}
	}
};