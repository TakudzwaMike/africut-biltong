import { OrderService } from '$lib/server/services/OrderService';
import { error, redirect } from '@sveltejs/kit';

export async function load({ url, locals }) {
    const publicId = url.searchParams.get('order');

    if (!publicId) {
        throw redirect(302, '/store');
    }

    const orderService = new OrderService();
    const orderData = await orderService.getOrderByPublicId(Number(publicId));

    if (!orderData) {
        throw error(404, 'Order not found.');
    }

    // Security: Only allow the owner or an admin to view the receipt
    if (!locals.user || (orderData.userId !== locals.user.id && locals.user.role !== 'admin')) {
        throw error(403, 'You do not have permission to view this order.');
    }

    return { order: orderData };
}
