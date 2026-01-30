import { fail } from '@sveltejs/kit';
import { TrackedLinkService } from '$lib/server/services/TrackedLinkService';
import { log } from '$lib/server/auditLog';

const linkService = new TrackedLinkService();
const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
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
		const formData = await request.formData();
		const slug = String(formData.get('slug'));
		const destinationUrl = String(formData.get('destinationUrl'));
		const description = String(formData.get('description'));

		if (!slug || !destinationUrl) return fail(400, { message: 'Slug and Destination URL are required' });

		try {
			const link = await linkService.createLink(locals.user.id, {
				slug,
				destinationUrl,
				description
			});

			await log(locals.user.id, 'create_tracked_link', { targetId: link.id, data: { slug } });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to create tracked link' });
		}
	},

	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id'));

		try {
			await linkService.deleteLink(locals.user.id, id);
			await log(locals.user.id, 'delete_tracked_link', { targetId: id });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to delete tracked link' });
		}
	}
};