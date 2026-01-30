import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { OrderService } from '$lib/server/services/OrderService';

const orderService = new OrderService();

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have access to Orders.');
	}

	try {
		const orderData = await orderService.getOrderWithDetails(params.id);
		return { order: orderData };
	} catch (e) {
		throw error(404, 'Order not found');
	}
}

export const actions = {
	updateStatus: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized: You do not have permission to update orders.' });
		}

		const formData = await request.formData();
		const status = formData.get('status');

		await orderService.updateOrderStatus(locals.user.id, params.id, String(status));

		await log(locals.user.id, 'update_order_status', {
			targetId: params.id,
			data: { status }
		});

		return { success: true };
	}
};
