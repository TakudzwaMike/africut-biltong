import { db } from '$lib/server/db';
import { blogPost, caseStudy, client, pageContent, solution } from '$lib/server/db/schema.js';
import { eq, desc, isNotNull } from 'drizzle-orm';

/** @type {import('../$types').PageServerLoad} */
export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		with: {
			client: true,
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
			},
			featuredImage: true
		}
	});

	const clients = await db.query.client.findMany({
		where: isNotNull(client.mediaId),
		orderBy: desc(client.id),
		with: {
			logo: true
		}
	});

	const contentList = await db.query.pageContent.findMany({
		where: eq(pageContent.page, 'homepage'),
		with: {
			media: true
		}
	});

	const content = contentList.reduce((acc, item) => {
		acc[item.section] = item;
		return acc;
	}, {});

	const solutions = await db.query.solution.findMany({
		orderBy: desc(solution.id),
		limit: 3,
		with: {
			featuredImage: true
		}
	});

	return {
		caseStudies,
		posts,
		clients,
		content,
		solutions
	};
}