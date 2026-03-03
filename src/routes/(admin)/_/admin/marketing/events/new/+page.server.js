import { fail, redirect, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog';
import { MarketingService } from '$lib/server/services/MarketingService';

const marketingService = new MarketingService();
const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}
	return {};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const publicLabel = formData.get('publicLabel');
		const startsAt = formData.get('startsAt');
		const endsAt = formData.get('endsAt');

		if (!name || !startsAt || !endsAt) {
			return fail(400, { message: 'Name and Dates are required.' });
		}

		try {
			const newEvent = await marketingService.createSaleEvent(locals.user.id, {
				name,
				publicLabel,
				startsAt,
				endsAt
			});

			await log(locals.user.id, 'create_sale_event', {
				targetId: newEvent.id,
				data: { name: newEvent.name }
			});

			throw redirect(303, `/_/admin/marketing/events/${newEvent.id}`);

		} catch (err) {
			if (err.status === 303) throw err;
			if (err.status === 400) return fail(400, { message: err.body.message });
			return fail(500, { message: 'Could not create event.' });
		}
	}
};
