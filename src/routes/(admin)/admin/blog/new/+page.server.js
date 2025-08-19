import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

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
			const valuesToInsert = {
				authorId: locals.user.id,
				title: String(title),
				slug: String(slug),
				contentJson: content,
				isPublished,
				publishedAt: isPublished ? new Date() : null
			};
			const [newPost] = await db.insert(blogPost).values(valuesToInsert).returning();

			await log(locals.user?.id, 'create_blog_post', {
				targetId: newPost.id,
				data: newPost
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