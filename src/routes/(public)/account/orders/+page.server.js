import { OrderService } from '$lib/server/services/OrderService';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    if (!locals.user) throw redirect(303, '/login');

    const orderService = new OrderService();
    const result = await orderService.listOrders({ userId: locals.user.id });
    const orders = result.orders || [];

    return { orders };
}
