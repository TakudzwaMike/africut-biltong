import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import * as paynow from '$lib/server/payment/paynow.js';
import * as paystack from '$lib/server/payment/paystack.js';
import { inArray, eq, sql, and, lte, gte, or, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

// Import the logic to fetch active sales
import { getActiveSales } from '$lib/server/pricing'; 

const initiateCheckoutSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive()
    })).min(1),
    currency: z.enum(['USD', 'ZAR']),
    shippingAddressId: z.string().min(1).optional(),
    paymentMethod: z.string(),
    phone: z.string().optional(),
    discountCode: z.string().optional()
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

    const { items, currency, shippingAddressId, paymentMethod, phone, discountCode: codeStr } = parseResult.data;

    let newOrder;

    try {
        // 1. Prepare Pricing Context (Active Sales)
        // We fetch this *outside* the transaction to minimize transaction time, 
        // though strictly speaking it could change during the transaction. 
        // For a standard store, fetching immediately before is acceptable.
        const { events, prices: salePrices } = await getActiveSales();

        // 2. Create Order in Database
        newOrder = await db.transaction(async (tx) => {
            const variantIds = items.map(item => item.variantId);
            
            // Fetch variants with product info
            const variants = await tx.query.productVariant.findMany({
                where: inArray(schema.productVariant.id, variantIds),
                with: { product: true }
            });

            let subtotalCents = 0;

            // Validate Stock & Calculate Subtotal
            for (const item of items) {
                const variant = variants.find(v => v.id === item.variantId);
                
                if (!variant) throw new Error(`Product variant ID ${item.variantId} not found.`);
                
                // Stock Check
                if (variant.product.type === 'physical' && variant.stock !== null) {
                    if (variant.stock < item.quantity) {
                        throw new Error(`Not enough stock for ${variant.product.name} - ${variant.name}. Available: ${variant.stock}`);
                    }
                }

                // --- PRICING LOGIC (Base vs Sale) ---
                let unitPrice = currency === 'USD' ? variant.priceUsd : variant.priceZar;
                if (unitPrice === null) throw new Error(`Price for ${variant.product.name} not available in ${currency}.`);

                // Check for active sale override
                // We filter salePrices for this specific variant
                const variantSales = salePrices.filter(sp => sp.variantId === variant.id);
                
                if (variantSales.length > 0) {
                    // Find the lowest applicable sale price
                    for (const sale of variantSales) {
                        const salePrice = currency === 'USD' ? sale.salePriceUsd : sale.salePriceZar;
                        // If sale price exists and is lower than current best price, take it
                        if (salePrice !== null && salePrice < unitPrice) {
                            unitPrice = salePrice;
                        }
                    }
                }

                subtotalCents += unitPrice * item.quantity;
                
                // Attach the calculated price to the item object for use in OrderItem insertion
                item.calculatedPrice = unitPrice; 
            }

            // --- DISCOUNT LOGIC ---
            let discountAmount = 0;
            let appliedCodeId = null;

            if (codeStr) {
                const normalizedCode = codeStr.trim().toUpperCase();
                const now = new Date();

                const validCode = await tx.query.discountCode.findFirst({
                    where: and(
                        eq(schema.discountCode.code, normalizedCode),
                        eq(schema.discountCode.isActive, true),
                        or(isNull(schema.discountCode.startsAt), lte(schema.discountCode.startsAt, now)),
                        or(isNull(schema.discountCode.endsAt), gte(schema.discountCode.endsAt, now))
                    )
                });

                if (validCode) {
                    const limitReached = validCode.usageLimit !== null && validCode.usageCount >= validCode.usageLimit;
                    const minOrderMet = validCode.minOrderAmount === null || subtotalCents >= validCode.minOrderAmount;

                    if (!limitReached && minOrderMet) {
                        if (validCode.type === 'percentage') {
                            discountAmount = Math.round(subtotalCents * (validCode.value / 100));
                        } else {
                            discountAmount = validCode.value;
                        }
                        
                        if (discountAmount > subtotalCents) discountAmount = subtotalCents;
                        appliedCodeId = validCode.id;

                        // Increment usage
                        await tx.update(schema.discountCode)
                            .set({ usageCount: sql`${schema.discountCode.usageCount} + 1` })
                            .where(eq(schema.discountCode.id, validCode.id));
                    }
                }
            }

            const finalTotal = subtotalCents - discountAmount;

            // Insert Order
            const orderId = createId();
            const [createdOrder] = await tx.insert(schema.order).values({
                id: orderId,
                userId: locals.user.id,
                subtotal: subtotalCents,
                total: finalTotal,
                discountAmount: discountAmount,
                discountCodeId: appliedCodeId,
                currency: currency,
                shippingAddressId: shippingAddressId || null,
                status: 'pending'
            }).returning();

            // Insert Order Items using calculated prices
            const orderItemsData = items.map(item => {
                return {
                    id: createId(),
                    orderId: createdOrder.id,
                    productVariantId: item.variantId,
                    quantity: item.quantity,
                    priceAtPurchase: item.calculatedPrice // Use the sale-adjusted price
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

        if (newOrder.total <= 0) {
             await db.update(schema.order).set({ status: 'paid' }).where(eq(schema.order.id, newOrder.id));
             return json({
                 orderId: newOrder.id,
                 orderPublicId: newOrder.publicId,
                 status: 'paid',
                 pollUrl: null,
                 redirectUrl: `/checkout/success?order=${newOrder.publicId}`
             });
        }

        if (currency === 'USD') {
            if (paymentMethod === 'card') {
                paymentResponse = await paynow.initiateRedirectTransaction(orderPublicId, newOrder.total, locals.user.email);
            } else {
                if (!phone) throw error(400, 'Phone number required for mobile money.');
                paymentResponse = await paynow.initiateExpressTransaction(orderPublicId, newOrder.total, locals.user.email, paymentMethod, phone);
            }
        } else {
            paymentResponse = await paystack.initiateRedirectTransaction(orderPublicId, newOrder.total, locals.user.email);
        }

        if (paymentResponse.pollurl) {
            await db.update(schema.order)
                .set({ paymentGatewayPollUrl: paymentResponse.pollurl })
                .where(eq(schema.order.id, newOrder.id));
        }

        return json({
            orderId: newOrder.id,
            orderPublicId: newOrder.publicId,
            redirectUrl: paymentResponse.browserurl || paymentResponse.authorization_url,
            pollUrl: paymentResponse.pollurl,
            status: paymentResponse.status
        });

    } catch (e) {
        console.error('Payment Gateway Error:', e);
        await db.update(schema.order).set({ status: 'cancelled' }).where(eq(schema.order.id, newOrder.id));
        throw error(500, { message: "Payment provider failed to initiate transaction." });
    }
}
