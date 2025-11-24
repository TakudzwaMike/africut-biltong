import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { validateWebhook } from '$lib/server/payment/paystack.js';
import { eq } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '$lib/server/email';

export async function POST({ request }) {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // 1. Security Check
    if (!validateWebhook(rawBody, signature)) {
        return new Response('Invalid Signature', { status: 401 });
    }

    const event = JSON.parse(rawBody);

    // 2. Filter Events
    if (event.event !== 'charge.success') {
        return new Response('OK');
    }

    const orderPublicId = Number(event.data.metadata.order_public_id);

    // 3. Update DB
    const [updatedOrder] = await db.update(order)
        .set({ status: 'paid' })
        .where(eq(order.publicId, orderPublicId))
        .returning();

    // 4. Send Email
    if (updatedOrder) {
        const fullOrder = await db.query.order.findFirst({
            where: eq(order.id, updatedOrder.id),
            with: {
                user: true,
                items: { with: { variant: { with: { product: true } } } }
            }
        });

        if (fullOrder) {
             const simpleOrder = {
                ...fullOrder,
                items: fullOrder.items.map(i => ({
                    productName: `${i.variant.product.name} (${i.variant.name})`,
                    quantity: i.quantity,
                    priceAtPurchase: (i.priceAtPurchase / 100).toFixed(2)
                }))
            };
            await sendOrderConfirmationEmail(fullOrder.user.email, simpleOrder);
        }
    }

    return new Response('OK');
}