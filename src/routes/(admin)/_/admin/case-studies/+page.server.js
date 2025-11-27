import { db } from '$lib/server/db';
import { caseStudy, client } from '$lib/server/db/schema.js';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;
const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ url, locals }) {
	// 1. Security Check
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage case studies.');
	}

	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(caseStudy.title, searchStr),
			ilike(caseStudy.slug, searchStr)
		);
	}

	const [caseStudies, totalResult] = await Promise.all([
		db.query.caseStudy.findMany({
			where: filters,
			orderBy: desc(caseStudy.id),
			with: {
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
		// 2. Security Check
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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