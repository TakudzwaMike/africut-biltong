import { fail, redirect, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { BlogService } from '$lib/server/services/BlogService';


const blogService = new BlogService();

export async function load({ params, locals }) {
	// 1. Security Check (View)
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to edit blog posts.');
	}

	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const post = await blogService.getPost(id);

	if (!post) {
		throw error(404, 'Post not found');
	}

	const mediaItems = await blogService.listMedia();
	const allCategories = await blogService.listCategories();

	return { post, mediaItems, allCategories };
}

export const actions = {
	default: async ({ request, params, locals }) => {
		// 2. Security Check (Action)
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = Number(params.id);
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
			// Get current post to determine publish logic
			const currentPost = await blogService.getPost(id);
			if (!currentPost) return fail(404, { message: 'Post not found' });

			let finalIsPublished = false;
			let finalPublishedAt = currentPost?.publishedAt || null; // Keep old date by default
			const now = new Date();
			const scheduledDate = publishedAt ? new Date(String(publishedAt)) : now;

			if (publishIntent) {
				if (scheduledDate <= now) {
					// Publish immediately
					finalIsPublished = true;
					// Only update the publish date if it wasn't already published
					finalPublishedAt = currentPost?.isPublished ? currentPost.publishedAt : scheduledDate;
				} else {
					// Schedule for the future
					finalIsPublished = false;
					finalPublishedAt = scheduledDate;
				}
			} else {
				// If user unchecks "publish", it becomes a draft
				finalIsPublished = false;
				finalPublishedAt = null;
			}

			const dataToUpdate = {
				title: String(title),
				slug: String(slug),
				contentJson: content,
				isPublished: finalIsPublished,
				publishedAt: finalPublishedAt,
				mediaId: mediaId ? Number(mediaId) : null
			};

			// Use Service Method
			await blogService.updatePostWithCategories(locals.user.id, id, dataToUpdate, categoryIds);

			await log(locals.user?.id, 'update_blog_post', {
				targetId: id,
				data: { ...dataToUpdate, categoryIds }
			});
		} catch (error) {
			console.error('Error updating blog post:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not update the blog post.' });
		}

		throw redirect(302, '/_/admin/blog');
	}
};