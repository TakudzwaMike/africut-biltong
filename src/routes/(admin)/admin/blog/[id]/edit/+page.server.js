import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.id, id)
	});

	if (!post) {
		throw error(404, 'Post not found');
	}

	return { post };
}

export const actions = {
	default: async ({ request, params }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { title, slug, contentJson } = data;
		const isPublished = data.isPublished === 'on';

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
			// Check if we are publishing a draft
			const currentPost = await db.query.blogPost.findFirst({
				where: eq(blogPost.id, id),
				columns: { isPublished: true }
			});

			const shouldSetPublishedDate = isPublished && !currentPost?.isPublished;

			await db
				.update(blogPost)
				.set({
					title: String(title),
					slug: String(slug),
					contentJson: content,
					isPublished,
					publishedAt: shouldSetPublishedDate ? new Date() : null
				})
				.where(eq(blogPost.id, id));
		} catch (error) {
			console.error('Error updating blog post:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not update the blog post.' });
		}

		throw redirect(302, '/admin/blog');
	}
};