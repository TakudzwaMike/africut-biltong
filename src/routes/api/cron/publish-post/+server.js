import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema.js';
import { and, lte, eq, isNotNull, inArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const GET = async () => {
	try {
		const now = new Date();

		// Find posts that are scheduled to be published and are not already published
		const postsToPublish = await db
			.select({ id: blogPost.id })
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

		// Update the posts
		await db.update(blogPost).set({ isPublished: true }).where(inArray(blogPost.id, postIds));

		return json(
			{ message: `Successfully published ${postIds.length} post(s).`, publishedIds: postIds },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Cron job failed:', error);
		return json({ message: 'Cron job failed.', error: error.message }, { status: 500 });
	}
};