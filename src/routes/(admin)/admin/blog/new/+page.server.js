import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { title, slug, contentJson } = data;
		const isPublished = data.isPublished === 'on';

		if (!locals.user?.id) {
			return fail(401, { data, message: 'You must be logged in to create a post.' });
		}

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
			await db.insert(blogPost).values({
				authorId: locals.user.id,
				title: String(title),
				slug: String(slug),
				contentJson: content,
				isPublished,
				publishedAt: isPublished ? new Date() : null
			});
		} catch (error) {
			console.error('Error creating blog post:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { data, message: 'This slug is already in use. Please choose another.' });
			}
			return fail(500, { data, message: 'Could not create the blog post.' });
		}

		throw redirect(302, '/admin/blog');
	}
};