import { db } from '$lib/server/db';
import { order } from '$lib/server/db/schema';
import { validateHash } from '$lib/server/payment/paynow.js';
import { eq } from 'drizzle-orm';
import { sendOrderConfirmationEmail } from '$lib/server/email';

export async function POST({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // 1. Security Check
    if (!validateHash(data)) {
        return new Response('Invalid Hash', { status: 400 });
    }

    const orderPublicId = Number(data.reference);
    const status = data.status.toLowerCase();

    let newStatus;
    if (status === 'paid' || status === 'delivered') newStatus = 'paid';
    else if (status === 'cancelled' || status === 'failed') newStatus = 'cancelled';
    else return new Response('Ignored Status'); // 'created', 'sent', etc.

    // 2. Update DB
    const [updatedOrder] = await db.update(order)
        .set({ status: newStatus })
        .where(eq(order.publicId, orderPublicId))
        .returning();

    // 3. Send Email (if paid)
    if (updatedOrder && newStatus === 'paid') {
         // Fetch full order details for email
         const fullOrder = await db.query.order.findFirst({
            where: eq(order.id, updatedOrder.id),
            with: {
                user: true,
                items: { with: { variant: { with: { product: true } } } }
            }
        });
        
        if (fullOrder) {
            // Flatten structure for the email template
            const simpleOrder = {
                ...fullOrder,
                items: fullOrder.items.map(i => ({
                    productName: `${i.variant.product.name} (${i.variant.name})`,
                    quantity: i.quantity,
                    priceAtPurchase: (i.priceAtPurchase / 100).toFixed(2) // Convert cents to dollars for display
                }))
            };
            await sendOrderConfirmationEmail(fullOrder.user.email, simpleOrder);
        }
    }

    return new Response('OK');
}