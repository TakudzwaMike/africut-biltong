import { db } from '$lib/server/db';
import { solution } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const solutions = await db.query.solution.findMany({
		orderBy: desc(solution.id),
		with: {
			featuredImage: true
		}
	});
	return { solutions };
}