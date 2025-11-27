import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';

export async function load({ url, locals }) {
    const publicId = url.searchParams.get('order');

    if (!publicId) {
        throw redirect(302, '/store');
    }

    // Fetch order with details
    const orderData = await db.query.order.findFirst({
        where: eq(order.publicId, Number(publicId)),
        with: {
            items: {
                with: {
                    variant: {
                        with: { product: true }
                    }
                }
            },
            shippingAddress: true,
            discountCode: true
        }
    });

    if (!orderData) {
        throw error(404, 'Order not found.');
    }

    // Security: Only allow the owner or an admin to view the receipt
    // Or if it's a guest checkout (not implemented yet, but good for future), check session ID match?
    // For now, strict user check.
    if (!locals.user || (orderData.userId !== locals.user.id && locals.user.role !== 'admin')) {
        throw error(403, 'You do not have permission to view this order.');
    }

    return { order: orderData };
}
