import { db } from '$lib/server/db';
import { caseStudy } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export async function load() {
	const caseStudies = await db.query.caseStudy.findMany({
		orderBy: desc(caseStudy.id)
	});
	return { caseStudies };
}

export const actions = {
	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			await db.delete(caseStudy).where(eq(caseStudy.id, Number(id)));
		} catch (error) {
			return fail(500, { message: 'Could not delete the case study.' });
		}

		return {
			status: 200
		};
	}
};