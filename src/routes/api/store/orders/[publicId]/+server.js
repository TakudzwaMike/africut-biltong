import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { order as orderTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateHash } from '$lib/server/payment/paynow.js'; // Reusing validation logic
import querystring from 'querystring';

export async function GET({ params, locals }) {
    const { publicId } = params;
    
    if (!locals.user) throw error(401, 'Unauthorized');

    // 1. Fetch Order
    const [order] = await db.select({
        id: orderTable.id,
        status: orderTable.status,
        userId: orderTable.userId,
        pollUrl: orderTable.paymentGatewayPollUrl
    }).from(orderTable).where(eq(orderTable.publicId, Number(publicId)));

    if (!order) throw error(404, 'Order not found.');

    // 2. Security: Only owner or admin
    if (order.userId !== locals.user.id && locals.user.role !== 'admin') {
        throw error(403, 'Forbidden');
    }

    // 3. Optimization: Return immediately if already final
    if (order.status !== 'pending' || !order.pollUrl) {
        return json({ status: order.status });
    }

    // 4. Poll Paynow (Server-side Proxy)
    try {
        const response = await fetch(order.pollUrl, { method: 'POST', body: '' });
        const responseText = await response.text();
        const paynowData = querystring.parse(responseText);

        if (!validateHash(paynowData)) {
            return json({ status: order.status }); // Ignore invalid responses
        }

        const paynowStatus = paynowData.status.toLowerCase();
        let newStatus = null;

        if (paynowStatus === 'paid' || paynowStatus === 'delivered') newStatus = 'paid';
        if (paynowStatus === 'cancelled' || paynowStatus === 'failed') newStatus = 'cancelled';

        if (newStatus && newStatus !== order.status) {
            await db.update(orderTable)
                .set({ status: newStatus })
                .where(eq(orderTable.id, order.id));
            return json({ status: newStatus });
        }

        return json({ status: order.status }); // Still pending

    } catch (e) {
        console.error('Polling Error:', e);
        return json({ status: order.status });
    }
}