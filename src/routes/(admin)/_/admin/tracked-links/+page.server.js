import { error, fail } from '@sveltejs/kit';
import { TrackedLinkService } from '$lib/server/services/TrackedLinkService';
import { log } from '$lib/server/auditLog';

const linkService = new TrackedLinkService();
const ITEMS_PER_PAGE = 20;

export async function load({ url, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		throw error(403, 'Forbidden');
	}
	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';

	const { links, totalItems, totalPages } = await linkService.listLinks({
		page,
		limit: ITEMS_PER_PAGE,
		query
	});

	return {
		links,
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
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		const destinationUrl = String(formData.get('destinationUrl'));
		const description = String(formData.get('description'));

		if (!destinationUrl) return fail(400, { message: 'Destination URL is required' });

		try {
			const link = await linkService.createLink(locals.user.id, {
				destinationUrl,
				description,
				userId: locals.user.id
			});

			await log(locals.user.id, 'create_tracked_link', { targetId: link.id, data: { destinationUrl } });
			return { success: true, message: 'Tracked link created successfully.' };
		} catch (err) {
			console.error('[TrackedLinksActionError]', err);
			return fail(500, { message: 'Failed to create tracked link' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || locals.user.role !== 'admin') {
			return fail(403, { message: 'Unauthorized' });
		}
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'ID is required' });

		try {
			await linkService.deleteLink(locals.user.id, id);
			await log(locals.user.id, 'delete_tracked_link', { targetId: id });
			return { success: true, message: 'Tracked link deleted successfully.' };
		} catch (err) {
			return fail(500, { message: 'Failed to delete tracked link' });
		}
	}
};