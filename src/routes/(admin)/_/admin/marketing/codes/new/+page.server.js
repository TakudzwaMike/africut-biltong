import { fail, redirect, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog';
import { MarketingService } from '$lib/server/services/MarketingService';

const marketingService = new MarketingService();
const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
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

		try {
			const newCode = await marketingService.createDiscountCode(locals.user.id, {
				code: formData.get('code'),
				type: formData.get('type'),
				valueRaw: formData.get('value'),
				usageLimitRaw: formData.get('usageLimit'),
				minOrderRaw: formData.get('minOrderAmount'),
				startsAt: formData.get('startsAt'),
				endsAt: formData.get('endsAt')
			});

			await log(locals.user.id, 'create_discount_code', {
				targetId: newCode.id,
				data: { code: newCode.code }
			});

			throw redirect(303, '/_/admin/marketing');

		} catch (err) {
			if (err.status === 303) throw err;
			if (err.status === 400) return fail(400, { message: err.body.message });

			console.error('Error creating discount code:', err);
			return fail(500, { message: 'Could not create code.' });
		}
	}
};
