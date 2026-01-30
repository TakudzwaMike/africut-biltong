import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { MarketingService } from '$lib/server/services/MarketingService';


const marketingService = new MarketingService();

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const code = await marketingService.getCodeById(params.id);
		return { code };
	} catch (e) {
		throw error(404, 'Discount code not found');
	}
}

export const actions = {
	update: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const codeName = formData.get('code');
		const type = formData.get('type');
		const valueRaw = formData.get('value');
		const usageLimitRaw = formData.get('usageLimit');
		const minOrderRaw = formData.get('minOrderAmount');
		const startsAt = formData.get('startsAt');
		const endsAt = formData.get('endsAt');
		const isActive = formData.get('isActive') === 'on';

		try {
			let value = Number(valueRaw);
			if (type === 'fixed') {
				value = Math.round(value * 100);
			}

			const minOrderAmount = minOrderRaw ? Math.round(Number(minOrderRaw) * 100) : null;
			const usageLimit = usageLimitRaw ? parseInt(String(usageLimitRaw)) : null;

			const updateData = {
				code: String(codeName).toUpperCase().trim(),
				type: String(type),
				value,
				usageLimit,
				minOrderAmount,
				startsAt: startsAt ? new Date(String(startsAt)) : null,
				endsAt: endsAt ? new Date(String(endsAt)) : null,
				isActive
			};

			await marketingService.updateCode(locals.user.id, params.id, updateData);

			await log(locals.user.id, 'update_discount_code', { targetId: params.id, data: { code: codeName } });
			return { success: true, message: 'Code updated.' };

		} catch (err) {
			console.error('Error updating discount code:', err);
			if (err.message.includes('unique constraint')) {
				return fail(400, { message: 'Code already exists.' });
			}
			return fail(500, { message: 'Update failed.' });
		}
	},

	delete: async ({ params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) return fail(403);
		try {
			await marketingService.deleteCode(locals.user.id, params.id);
			await log(locals.user.id, 'delete_discount_code', { targetId: params.id });
			return { success: true, deleted: true };
		} catch (e) {
			return fail(500, { message: 'Delete failed.' });
		}
	}
};
