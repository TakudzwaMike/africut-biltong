import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema';
import { desc, eq, or, ilike, count, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;

export async function load({ url }) {
	// 1. Get Query Params
	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

	// 2. Build Filter Conditions
	let filters = undefined;
	if (query) {
		const searchStr = `%${query}%`;
		filters = or(
			ilike(lead.firstName, searchStr),
			ilike(lead.lastName, searchStr),
			ilike(lead.email, searchStr),
			ilike(lead.status, searchStr)
		);
	}

	// 3. Execute Queries in Parallel
	const [leads, totalResult] = await Promise.all([
		// Fetch Data
		db.query.lead.findMany({
			where: filters,
			orderBy: desc(lead.createdAt),
			with: {
				solution: true
			},
			limit: ITEMS_PER_PAGE,
			offset: offset
		}),
		// Fetch Total Count (for pagination UI)
		db.select({ count: count() })
			.from(lead)
			.where(filters)
	]);

	const totalItems = totalResult[0].count;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return { 
		leads, 
		pagination: {
			page,
			totalPages,
			totalItems,
			query
		}
	};
}

export const actions = {
	updateStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status');

		if (isNaN(id) || !status) {
			return fail(400, { message: 'Invalid request.' });
		}

		try {
			await db.update(lead).set({ status: String(status) }).where(eq(lead.id, id));

			await log(locals.user?.id, 'update_lead_status', {
				targetId: id,
				data: { status }
			});

			return { success: true, message: 'Status updated.' };
		} catch (error) {
			console.error('Error updating lead status:', error);
			return fail(500, { message: 'Could not update status.' });
		}
	}
};