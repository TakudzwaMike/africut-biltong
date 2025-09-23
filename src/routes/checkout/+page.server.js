import { db } from '$lib/server/db';
import { order, orderItem, product } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { eq, inArray, and, sql } from 'drizzle-orm';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const cartItems = JSON.parse(formData.get('cartItems') || '[]');
		const customerName = formData.get('customerName');
		const customerEmail = formData.get('customerEmail');

		if (!cartItems || cartItems.length === 0) {
			return fail(400, { message: 'Your cart is empty.' });
		}
		if (!customerName || !customerEmail) {
			return fail(400, { message: 'Name and email are required.' });
		}

		// In a real app, you would validate the prices against the database here.
		const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
		const currency = cartItems[0]?.currency || 'USD';

		try {
			const [newOrder] = await db.transaction(async (tx) => {
				const [createdOrder] = await tx
					.insert(order)
					.values({
						customerName: String(customerName),
						customerEmail: String(customerEmail),
						totalAmount,
						currency,
						status: 'paid' // Mocking a successful payment
					})
					.returning();

				const itemsToInsert = cartItems.map((item) => ({
					orderId: createdOrder.id,
					productId: item.id,
					quantity: item.quantity,
					priceAtPurchase: item.price
				}));

				await tx.insert(orderItem).values(itemsToInsert);

				// Decrement stock for physical products
				const physicalProductIds = (
					await tx
						.select({ id: product.id })
						.from(product)
						.where(
							and(
								eq(product.type, 'physical'),
								inArray(
									product.id,
									cartItems.map((i) => i.id)
								)
							)
						)
				).map((p) => p.id);

				for (const item of cartItems) {
					if (physicalProductIds.includes(item.id)) {
						await tx
							.update(product)
							.set({ stockQuantity: sql`${product.stockQuantity} - ${item.quantity}` })
							.where(eq(product.id, item.id));
					}
				}

				return [createdOrder];
			});

			await log(null, 'create_order', { targetId: newOrder.id, data: { ...newOrder, items: cartItems } });
		} catch (error) {
			console.error('Error creating order:', error);
			return fail(500, { message: 'Could not process your order.' });
		}

		throw redirect(303, `/order/success`);
	}
};