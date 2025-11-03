import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function load() {
	const posts = await db.query.blogPost.findMany({
		where: eq(blogPost.isPublished, true),
		orderBy: desc(blogPost.publishedAt),
		with: {
			author: {
				columns: {
					username: true
				}
			},
			featuredImage: true,
			categories: {
				with: {
					category: true
				}
			}
		}
	});

	return { posts };
}