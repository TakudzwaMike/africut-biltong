import { db } from '$lib/server/db';
import { caseStudy } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		orderBy: desc(caseStudy.id)
	});
	return { caseStudies };
}

export const actions = {
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const csToDelete = await db.query.caseStudy.findFirst({
				where: eq(caseStudy.id, Number(id)),
				with: { results: true }
			});

			if (!csToDelete) {
				return fail(404, { message: 'Case study not found.' });
			}

			await db.delete(caseStudy).where(eq(caseStudy.id, Number(id)));

			await log(locals.user?.id, 'delete_case_study', {
				targetId: id,
				data: csToDelete
			});

			return { status: 200, message: 'Case study deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the case study.' });
		}
	}
};