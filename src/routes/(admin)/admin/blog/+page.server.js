import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

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
	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			await db.delete(blogPost).where(eq(blogPost.id, Number(id)));
		} catch (error) {
			return fail(500, { message: 'Could not delete the post.' });
		}

		return {
			status: 200
		};
	}
};