import { db } from '$lib/server/db';
import { solution } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load() {
	const solutions = await db.query.solution.findMany({
		orderBy: desc(solution.id)
	});
	return { solutions };
}

export const actions = {
	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			await db.delete(solution).where(eq(solution.id, Number(id)));
		} catch (error) {
			return fail(500, { message: 'Could not delete the solution.' });
		}

		return {
			status: 200
		};
	}
};