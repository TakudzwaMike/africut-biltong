import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { PartnerService } from '$lib/server/services/PartnerService';


const partnerService = new PartnerService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	return {
		partners: await partnerService.listPartners()
	};
}

export const actions = {
	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			await partnerService.deletePartner(locals.user.id, Number(id));

			await log(locals.user?.id, 'delete_client', { targetId: id });

			return { success: true, message: 'Client deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the client.' });
		}
	}
};
