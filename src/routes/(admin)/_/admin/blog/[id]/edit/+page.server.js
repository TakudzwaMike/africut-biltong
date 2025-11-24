import { db } from '$lib/server/db';
import { blogPost, media, blogCategory, blogPostsToCategories } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.id, id),
		with: {
			featuredImage: true,
			categories: {
				with: {
					category: true
				}
			}
		}
	});

	if (!post) {
		throw error(404, 'Post not found');
	}

	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	
	const allCategories = await db.query.blogCategory.findMany({
		orderBy: desc(blogCategory.name)
	});

	return { post, mediaItems, allCategories };
}

export const actions = {
	default: async ({ request, params, locals }) => {
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
			const currentPost = await db.query.blogPost.findFirst({
				where: eq(blogPost.id, id),
				columns: { isPublished: true, publishedAt: true }
			});

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

			await db.transaction(async (tx) => {
				await tx.update(blogPost).set(dataToUpdate).where(eq(blogPost.id, id));
				
				// Sync categories
				await tx.delete(blogPostsToCategories).where(eq(blogPostsToCategories.postId, id));
				if (categoryIds.length > 0) {
					await tx.insert(blogPostsToCategories).values(
						categoryIds.map((catId) => ({
							postId: id,
							categoryId: catId
						}))
					);
				}
			});


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
