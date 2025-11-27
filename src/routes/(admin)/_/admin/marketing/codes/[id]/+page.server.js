import { db } from '$lib/server/db';
import { discountCode } from '$lib/server/db/schema';
import { fail, redirect, error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog';

const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const code = await db.query.discountCode.findFirst({
		where: eq(discountCode.id, params.id)
	});

	if (!code) throw error(404, 'Discount code not found');

	return { code };
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

			await db.update(discountCode).set({
				code: String(codeName).toUpperCase().trim(),
				type: String(type),
				value,
				usageLimit,
				minOrderAmount,
				startsAt: startsAt ? new Date(String(startsAt)) : null,
				endsAt: endsAt ? new Date(String(endsAt)) : null,
				isActive
			}).where(eq(discountCode.id, params.id));

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
			await db.delete(discountCode).where(eq(discountCode.id, params.id));
			await log(locals.user.id, 'delete_discount_code', { targetId: params.id });
			return { success: true, deleted: true };
		} catch (e) {
			return fail(500, { message: 'Delete failed.' });
		}
	}
};
