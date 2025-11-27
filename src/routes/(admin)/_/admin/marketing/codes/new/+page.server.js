import { db } from '$lib/server/db';
import { discountCode } from '$lib/server/db/schema';
import { fail, redirect, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog';

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
		const code = formData.get('code');
		const type = formData.get('type'); // 'percentage' | 'fixed'
		const valueRaw = formData.get('value');
		const usageLimitRaw = formData.get('usageLimit');
		const minOrderRaw = formData.get('minOrderAmount');
		const startsAt = formData.get('startsAt');
		const endsAt = formData.get('endsAt');

		if (!code || !type || !valueRaw) {
			return fail(400, { message: 'Code, Type, and Value are required.' });
		}

		try {
			let value = Number(valueRaw);
			if (type === 'fixed') {
				value = Math.round(value * 100); // Convert dollars to cents
			}

			const minOrderAmount = minOrderRaw ? Math.round(Number(minOrderRaw) * 100) : null;
			const usageLimit = usageLimitRaw ? parseInt(String(usageLimitRaw)) : null;

			const [newCode] = await db.insert(discountCode).values({
				code: String(code).toUpperCase().trim(),
				type: String(type),
				value,
				usageLimit,
				minOrderAmount,
				startsAt: startsAt ? new Date(String(startsAt)) : null,
				endsAt: endsAt ? new Date(String(endsAt)) : null,
				isActive: true
			}).returning();

			await log(locals.user.id, 'create_discount_code', {
				targetId: newCode.id,
				data: { code: newCode.code }
			});

			throw redirect(303, '/_/admin/marketing');

		} catch (err) {
			if (err.status === 303) throw err;
			
			console.error('Error creating discount code:', err);
			if (err.message.includes('unique constraint')) {
				return fail(400, { message: 'This code already exists.' });
			}
			return fail(500, { message: 'Could not create code.' });
		}
	}
};
