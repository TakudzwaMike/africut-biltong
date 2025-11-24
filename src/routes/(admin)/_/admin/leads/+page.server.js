import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema';
import { desc, eq, or, ilike, count } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ITEMS_PER_PAGE = 20;
// Everyone on staff can see leads
const ALLOWED_ROLES = ['admin', 'store_manager', 'content_editor'];

export async function load({ url, locals }) {
	// SECURITY CHECK
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have access to Leads.');
	}

	const query = url.searchParams.get('q');
	const page = Number(url.searchParams.get('page')) || 1;
	const offset = (page - 1) * ITEMS_PER_PAGE;

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

	const [leads, totalResult] = await Promise.all([
		db.query.lead.findMany({
			where: filters,
			orderBy: desc(lead.createdAt),
			with: {
				solution: true
			},
			limit: ITEMS_PER_PAGE,
			offset: offset
		}),
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
		// SECURITY CHECK
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

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