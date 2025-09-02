import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { solution as solutionTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { slug } = params;

	const solution = await db.query.solution.findFirst({
		where: eq(solutionTable.slug, slug),
		with: {
			featuredImage: true
		}
	});

	if (!solution) {
		throw error(404, 'Solution not found');
	}

	return {
		solution
	};
}