import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { and, lte, eq, isNotNull, inArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async ({ request }) => {
	// 1. Security Check
	// You must add CRON_SECRET to your .env file and Vercel Environment Variables
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const now = new Date();

		// 2. Find posts scheduled for the past (or now) that are NOT yet published
		const postsToPublish = await db
			.select({ id: blogPost.id, title: blogPost.title })
			.from(blogPost)
			.where(
				and(
					eq(blogPost.isPublished, false),
					isNotNull(blogPost.publishedAt),
					lte(blogPost.publishedAt, now)
				)
			);

		if (postsToPublish.length === 0) {
			return json({ message: 'No posts to publish.' }, { status: 200 });
		}

		const postIds = postsToPublish.map((p) => p.id);

		// 3. Update them to published
		await db
			.update(blogPost)
			.set({ isPublished: true })
			.where(inArray(blogPost.id, postIds));

		console.log(`[CRON] Published ${postsToPublish.length} posts: ${postsToPublish.map(p => p.title).join(', ')}`);

		return json(
			{ 
				success: true, 
				message: `Successfully published ${postIds.length} post(s).`,
				publishedIds: postIds 
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('[CRON] Job failed:', error);
		return json({ message: 'Cron job failed.', error: error.message }, { status: 500 });
	}
};