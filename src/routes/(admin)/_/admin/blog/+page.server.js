import { db } from '$lib/server/db';
import { blogPost, userTable } from '$lib/server/db/schema.js'; // Ensure userTable is imported for joining if needed, though Drizzle relations handle it often
import { desc, eq, or, ilike, count, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	// 1. Get Query Params
	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// 2. Build Filter Conditions
	// Note: Searching mainly on Title and Slug. 
    // Searching joined relations (Author) in Drizzle requires slightly different syntax 
    // or a direct join, but for simplicity/speed, filtering by Title is usually sufficient.
	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(blogPost.title, searchStr),
			ilike(blogPost.slug, searchStr)
		);
	}

	// 3. Execute Queries
	const [posts, totalResult] = await Promise.all([
		db.query.blogPost.findMany({
			where: filters,
			orderBy: desc(blogPost.createdAt),
			with: {
				author: {
					columns: {
						username: true
					}
				}
			},
			limit: ITEMS_PER_PAGE,
			offset: offset
		}),
		db.select({ count: count() })
			.from(blogPost)
			.where(filters)
	]);

	const totalItems = totalResult[0].count;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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