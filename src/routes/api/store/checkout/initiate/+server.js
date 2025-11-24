import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import * as paynow from '$lib/server/payment/paynow.js';
import * as paystack from '$lib/server/payment/paystack.js';
import { inArray, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

const initiateCheckoutSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive()
    })).min(1),
    currency: z.enum(['USD', 'ZAR']),
    shippingAddressId: z.string().min(1).optional(), // Optional for digital/service
    paymentMethod: z.string(), // 'ecocash', 'card', 'onemoney'
    phone: z.string().optional()
});

export async function POST({ request, locals }) {
    if (!locals.user) {
        throw error(401, 'You must be logged in to place an order.');
    }

    const body = await request.json();
    const parseResult = initiateCheckoutSchema.safeParse(body);

    if (!parseResult.success) {
        throw error(400, { message: 'Invalid checkout data.', errors: parseResult.error.flatten().fieldErrors });
    }

    const { items, currency, shippingAddressId, paymentMethod, phone } = parseResult.data;

    let newOrder;

    try {
        // 1. Create Order in Database
        newOrder = await db.transaction(async (tx) => {
            const variantIds = items.map(item => item.variantId);
            
            // Fetch variants with product info
            const variants = await tx.query.productVariant.findMany({
                where: inArray(schema.productVariant.id, variantIds),
                with: { product: true }
            });

            let totalCents = 0;

            // Validate Stock & Calculate Total
            for (const item of items) {
                const variant = variants.find(v => v.id === item.variantId);
                
                if (!variant) throw new Error(`Product variant ID ${item.variantId} not found.`);
                
                // Check Stock (if physical)
                if (variant.product.type === 'physical' && variant.stock !== null) {
                    if (variant.stock < item.quantity) {
                        throw new Error(`Not enough stock for ${variant.product.name} - ${variant.name}. Available: ${variant.stock}`);
                    }
                }

                // Get Price
                const price = currency === 'USD' ? variant.priceUsd : variant.priceZar;
                if (price === null) throw new Error(`Price for ${variant.product.name} not available in ${currency}.`);

                totalCents += price * item.quantity;
            }

            // Insert Order
            const orderId = createId();
            const [createdOrder] = await tx.insert(schema.order).values({
                id: orderId,
                userId: locals.user.id,
                total: totalCents,
                currency: currency,
                shippingAddressId: shippingAddressId || null,
                status: 'pending'
            }).returning();

            // Insert Order Items
            const orderItemsData = items.map(item => {
                const variant = variants.find(v => v.id === item.variantId);
                return {
                    id: createId(),
                    orderId: createdOrder.id,
                    productVariantId: item.variantId,
                    quantity: item.quantity,
                    priceAtPurchase: currency === 'USD' ? variant.priceUsd : variant.priceZar
                };
            });
            await tx.insert(schema.orderItem).values(orderItemsData);

            // Deduct Stock
            for (const item of items) {
                const variant = variants.find(v => v.id === item.variantId);
                if (variant && variant.product.type === 'physical' && variant.stock !== null) {
                    await tx.update(schema.productVariant)
                        .set({ stock: sql`${schema.productVariant.stock} - ${item.quantity}` })
                        .where(eq(schema.productVariant.id, item.variantId));
                }
            }

            return createdOrder;
        });

    } catch (e) {
        console.error('Order Creation Error:', e);
        throw error(500, { message: e.message || "Failed to create order." });
    }

    // 2. Initiate Payment Gateway
    try {
        let paymentResponse;
        const orderPublicId = String(newOrder.publicId);

        if (currency === 'USD') {
            // PAYNOW (Zimbabwe)
            if (paymentMethod === 'card') {
                paymentResponse = await paynow.initiateRedirectTransaction(orderPublicId, newOrder.total, locals.user.email);
            } else {
                // Mobile Money (EcoCash / OneMoney)
                if (!phone) throw error(400, 'Phone number required for mobile money.');
                paymentResponse = await paynow.initiateExpressTransaction(orderPublicId, newOrder.total, locals.user.email, paymentMethod, phone);
            }
        } else {
            // PAYSTACK (ZAR / International)
            // Paystack only does redirect for our setup
            paymentResponse = await paystack.initiateRedirectTransaction(orderPublicId, newOrder.total, locals.user.email);
        }

        // Save Poll URL if Paynow provided one (for Express Checkout status checks)
        if (paymentResponse.pollurl) {
            await db.update(schema.order)
                .set({ paymentGatewayPollUrl: paymentResponse.pollurl })
                .where(eq(schema.order.id, newOrder.id));
        }

        // 3. Return Response to Frontend
        // Normalize response: Frontend expects `redirectUrl` (browser) or `pollUrl` (mobile push)
        return json({
            orderId: newOrder.id,
            orderPublicId: newOrder.publicId,
            redirectUrl: paymentResponse.browserurl || paymentResponse.authorization_url, // Paynow vs Paystack keys
            pollUrl: paymentResponse.pollurl,
            status: paymentResponse.status
        });

    } catch (e) {
        console.error('Payment Gateway Error:', e);
        // Cancel order if payment fails to initiate
        await db.update(schema.order).set({ status: 'cancelled' }).where(eq(schema.order.id, newOrder.id));
        throw error(500, { message: "Payment provider failed to initiate transaction." });
    }
}