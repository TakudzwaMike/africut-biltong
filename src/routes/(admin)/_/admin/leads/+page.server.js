import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { LeadService } from '$lib/server/services/LeadService';


const leadService = new LeadService();
const ITEMS_PER_PAGE = 20;

export async function load({ url, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';

	const { leads, totalItems, totalPages } = await leadService.listLeads({
		page,
		limit: ITEMS_PER_PAGE,
		query
	});

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
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status');

		if (!id || !status) {
			return fail(400, { message: 'ID and Status are required.' });
		}

		try {
			await leadService.updateLeadStatus(locals.user.id, id, String(status));

			await log(locals.user.id, 'update_lead_status', { targetId: id, data: { status } });

			return { success: true, message: 'Status updated.' };
		} catch (error) {
			return fail(500, { message: 'Could not update status.' });
		}
	}
};