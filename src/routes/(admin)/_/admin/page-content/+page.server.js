import { fail } from '@sveltejs/kit';
import { PageContentService } from '$lib/server/services/PageContentService';
import { log } from '$lib/server/auditLog';

const pageService = new PageContentService();

export async function load() {
	return {
		content: await pageService.getAllSections()
	};
}

export const actions = {
	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id')); // explicit number
		const title = String(formData.get('title'));
		const text = String(formData.get('text'));
		const linkLabel = formData.get('linkLabel') ? String(formData.get('linkLabel')) : null;
		const linkUrl = formData.get('linkUrl') ? String(formData.get('linkUrl')) : null;
		const mediaId = formData.get('mediaId') ? Number(formData.get('mediaId')) : null;

		try {
			await pageService.updateSection(id, {
				title,
				text,
				linkLabel,
				linkUrl,
				mediaId
			});

			await log(locals.user.id, 'update_page_content', {
				targetId: id,
				data: { title }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to update content' });
		}
	}
};
