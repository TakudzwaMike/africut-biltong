import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;
// Define allowed roles for this section
const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ url, locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage blog posts.');
	}

	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(blogPost.title, searchStr),
			ilike(blogPost.slug, searchStr)
		);
	}

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
		// 2. Security Check (Action)
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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