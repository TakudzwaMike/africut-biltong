import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have access to Orders.');
	}

	const orderData = await db.query.order.findFirst({
		where: eq(order.id, params.id),
		with: {
			user: true,
			shippingAddress: true,
			discountCode: true, // Added relation
			items: {
				with: {
					variant: {
						with: { product: true }
					}
				}
			}
		}
	});

	if (!orderData) throw error(404, 'Order not found');

	return { order: orderData };
}

export const actions = {
	updateStatus: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized: You do not have permission to update orders.' });
		}

		const formData = await request.formData();
		const status = formData.get('status');

		await db.update(order).set({ status: String(status) }).where(eq(order.id, params.id));
		
		await log(locals.user.id, 'update_order_status', { 
			targetId: params.id, 
			data: { status } 
		});

		return { success: true };
	}
};
