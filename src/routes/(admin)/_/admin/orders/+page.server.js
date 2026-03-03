import { fail, error } from '@sveltejs/kit';
import { OrderService } from '$lib/server/services/OrderService';
import { log } from '$lib/server/auditLog';

const orderService = new OrderService();
const ITEMS_PER_PAGE = 20;
const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ url, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have access to Orders.');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const query = url.searchParams.get('q') || '';
	const status = url.searchParams.get('status') || 'all';

	const { orders, totalItems, totalPages } = await orderService.listOrders({
		page,
		limit: ITEMS_PER_PAGE,
		query,
		status
	});

	return {
		orders,
		pagination: {
			page,
			totalPages,
			totalItems,
			query,
			status
		}
	};
}

export const actions = {
	updateStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = String(formData.get('id'));
		const status = String(formData.get('status'));

		try {
			await orderService.updateOrderStatus(locals.user.id, id, status);

			await log(locals.user.id, 'update_order_status', {
				targetId: id,
				data: { status }
			});

			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to update order status.' });
		}
	}
};