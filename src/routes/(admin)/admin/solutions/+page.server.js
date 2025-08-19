import { db } from '$lib/server/db';
import { solution } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const solutions = await db.query.solution.findMany({
		orderBy: desc(solution.id)
	});
	return { solutions };
}

export const actions = {
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const solutionToDelete = await db.query.solution.findFirst({
				where: eq(solution.id, Number(id))
			});

			if (!solutionToDelete) {
				return fail(404, { message: 'Solution not found.' });
			}

			await db.delete(solution).where(eq(solution.id, Number(id)));

			await log(locals.user?.id, 'delete_solution', {
				targetId: id,
				data: solutionToDelete
			});

			return { status: 200, message: 'Solution deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the solution.' });
		}
	}
};