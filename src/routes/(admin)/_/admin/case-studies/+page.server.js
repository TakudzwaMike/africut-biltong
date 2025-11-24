import { db } from '$lib/server/db';
import { caseStudy, client } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	// 1. Pagination & Search Params
	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// 2. Filters
    // Note: Filtering by Client Name is tricky without a join in the 'where' clause.
    // For simplicity/performance in this setup, we will search Case Study Title and Slug.
	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(caseStudy.title, searchStr),
			ilike(caseStudy.slug, searchStr)
		);
	}

	// 3. Execute Queries
	const [caseStudies, totalResult] = await Promise.all([
		db.query.caseStudy.findMany({
			where: filters,
			orderBy: desc(caseStudy.id),
			with: {
                // We still fetch client for display
                client: true
            },
			limit: ITEMS_PER_PAGE,
			offset: offset
		}),
		db.select({ count: count() })
			.from(caseStudy)
			.where(filters)
	]);

	const totalItems = totalResult[0].count;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return { 
		caseStudies, 
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
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