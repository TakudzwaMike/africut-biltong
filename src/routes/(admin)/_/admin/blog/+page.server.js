import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const posts = await db.query.blogPost.findMany({
		orderBy: desc(blogPost.createdAt),
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	});
	return { posts };
}

export const actions = {
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const postToDelete = await db.query.blogPost.findFirst({
				where: eq(blogPost.id, Number(id))
			});

			if (!postToDelete) {
				return fail(404, { message: 'Post not found.' });
			}

			await db.delete(blogPost).where(eq(blogPost.id, Number(id)));

			await log(locals.user?.id, 'delete_blog_post', {
				targetId: id,
				data: postToDelete
			});
		} catch (error) {
			return fail(500, { message: 'Could not delete the post.' });
		}

		return {
			status: 200
		};
	}
};