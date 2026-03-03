import { MediaService } from '$lib/server/services/MediaService';
import { BlogService } from '$lib/server/services/BlogService';
import { fail, redirect, error } from '@sveltejs/kit';

const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ locals }) {
	// Security Check (View)
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to create blog posts.');
	}

	const mediaService = new MediaService();
	const blogService = new BlogService();

	// Use services instead of direct db access
	const mediaItems = await mediaService.listMedia();
	const categories = await blogService.listCategories();

	return { mediaItems, categories };
}

export const actions = {
	default: async ({ request, locals }) => {
		// Security Check (Action)
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { title, slug, contentJson, mediaId, publishedAt } = data;
		const categoryIds = formData.getAll('categoryIds').map(Number);
		const publishIntent = data.isPublished === 'on';

		if (!title || !slug) {
			return fail(400, { data, message: 'Title and Slug are required.' });
		}

		let content;
		try {
			content = contentJson ? JSON.parse(String(contentJson)) : null;
		} catch (e) {
			return fail(400, { data, message: 'Invalid content format.' });
		}

		try {
			let finalIsPublished = false;
			let finalPublishedAt = null;
			const now = new Date();
			const scheduledDate = publishedAt ? new Date(String(publishedAt)) : now;

			if (publishIntent) {
				if (scheduledDate <= now) {
					// Publish immediately
					finalIsPublished = true;
					finalPublishedAt = scheduledDate;
				} else {
					// Schedule for the future
					finalIsPublished = false;
					finalPublishedAt = scheduledDate;
				}
			}

			const postData = {
				authorId: locals.user.id,
				title: String(title),
				slug: String(slug),
				contentJson: content,
				isPublished: finalIsPublished,
				publishedAt: finalPublishedAt,
				mediaId: mediaId ? Number(mediaId) : null,
				categoryIds
			};

			const blogService = new BlogService();
			await blogService.createPost(locals.user.id, postData);

		} catch (error) {
			console.error('Error creating blog post:', error);
			if (error.message.includes('duplicate key value violates unique constraint') ||
				error.message.includes('slug')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not create the blog post.' });
		}

		throw redirect(302, '/_/admin/blog');
	}
};