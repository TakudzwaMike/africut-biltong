import { db } from '$lib/server/db';
import { blogPost, media, blogCategory, blogPostsToCategories } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { desc } from 'drizzle-orm';

const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ locals }) {
    // 1. Security Check (View)
    if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
        throw error(403, 'Forbidden: You do not have permission to create blog posts.');
    }

	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	const categories = await db.query.blogCategory.findMany({
		orderBy: desc(blogCategory.name)
	});
	return { mediaItems, categories };
}

export const actions = {
	default: async ({ request, locals }) => {
        // 2. Security Check (Action)
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
					// Schedule for the future, save as draft for now
					finalIsPublished = false;
					finalPublishedAt = scheduledDate;
				}
			}

			const valuesToInsert = {
				authorId: locals.user.id,
				title: String(title),
				slug: String(slug),
				contentJson: content,
				isPublished: finalIsPublished,
				publishedAt: finalPublishedAt,
				mediaId: mediaId ? Number(mediaId) : null
			};
			const [newPost] = await db.insert(blogPost).values(valuesToInsert).returning();

			// Handle categories
			if (categoryIds.length > 0) {
				await db.insert(blogPostsToCategories).values(
					categoryIds.map((catId) => ({
						postId: newPost.id,
						categoryId: catId
					}))
				);
			}

			await log(locals.user?.id, 'create_blog_post', {
				targetId: newPost.id,
				data: { ...newPost, categoryIds }
			});
		} catch (error) {
			console.error('Error creating blog post:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not create the blog post.' });
		}

		throw redirect(302, '/_/admin/blog');
	}
};