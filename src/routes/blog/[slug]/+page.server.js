import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { slug } = params;

	const post = await db.query.blogPost.findFirst({
		where: and(eq(blogPost.slug, slug), eq(blogPost.isPublished, true)),
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	});

	if (!post) {
		throw error(404, 'Post not found');
	}

	return { post };
}