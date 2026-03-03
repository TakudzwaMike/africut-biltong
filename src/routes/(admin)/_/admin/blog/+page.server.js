import { fail } from '@sveltejs/kit';
import { BlogService } from '$lib/server/services/BlogService';
import { log } from '$lib/server/auditLog';

const blogService = new BlogService();
const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';

	const { posts, totalItems, totalPages } = await blogService.listPosts({
		page,
		limit: ITEMS_PER_PAGE,
		query
	});

	return {
		posts,
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
		const title = String(formData.get('title'));
		const slug = String(formData.get('slug'));
		const contentRaw = formData.get('content');
		const mediaId = formData.get('mediaId');
		const status = String(formData.get('status')) || 'draft';

		let contentJson = null;
		try {
			contentJson = contentRaw ? JSON.parse(String(contentRaw)) : null;
		} catch (e) {
			return fail(400, { message: 'Invalid content format.' });
		}

		try {
			const post = await blogService.createPost(locals.user.id, {
				title,
				slug,
				contentJson,
				mediaId: mediaId ? Number(mediaId) : null,
				isPublished: status === 'published',
				publishedAt: status === 'published' ? new Date() : null,
				authorId: locals.user.id
			});

			await log(locals.user.id, 'create_post', { targetId: post.id, data: { title } });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to create post.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'ID is required' });

		try {
			await blogService.deletePost(locals.user.id, id);
			await log(locals.user.id, 'delete_post', { targetId: id });
			return { status: 200, success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to delete post.' });
		}
	}
};