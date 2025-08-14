import { db } from '$lib/server/db';
import { blogPost, caseStudy } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		with: {
			client: true, // Eager load the related client
			results: true
		},
		limit: 3,
		orderBy: desc(caseStudy.id)
	});

	const posts = await db.query.blogPost.findMany({
		where: eq(blogPost.isPublished, true),
		orderBy: desc(blogPost.publishedAt),
		limit: 3,
		with: {
			author: {
				columns: {
					username: true
				}
			}
		}
	});

	return {
		caseStudies,
		posts
	};
}