import { db } from '$lib/server/db';
import { saleEvent, salePrice, product, productVariant } from '$lib/server/db/schema';
import { fail, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { log } from '$lib/server/auditLog';

const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const { id } = params;

	// 1. Fetch Event
	const event = await db.query.saleEvent.findFirst({
		where: eq(saleEvent.id, id)
	});

	if (!event) throw error(404, 'Event not found');

	// 2. Fetch all Products + Variants
	const products = await db.query.product.findMany({
		orderBy: desc(product.name),
		with: {
			variants: true
		}
	});

	// 3. Fetch Existing Prices for this Event
	const existingPrices = await db.query.salePrice.findMany({
		where: eq(salePrice.eventId, id)
	});

	// Create a Map for easy lookup in UI: variantId -> priceObj
	const priceMap = existingPrices.reduce((acc, item) => {
		acc[item.variantId] = item;
		return acc;
	}, {});

	return { event, products, priceMap };
}

export const actions = {
	updateEvent: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const publicLabel = formData.get('publicLabel');
		const startsAt = formData.get('startsAt');
		const endsAt = formData.get('endsAt');
		const isActive = formData.get('isActive') === 'on';

		try {
			await db.update(saleEvent).set({
				name: String(name),
				publicLabel: String(publicLabel),
				startsAt: new Date(String(startsAt)),
				endsAt: new Date(String(endsAt)),
				isActive
			}).where(eq(saleEvent.id, params.id));

			await log(locals.user.id, 'update_sale_event', { targetId: params.id, data: { name, isActive } });
			return { success: true, message: 'Event updated.' };
		} catch (err) {
			return fail(500, { message: 'Update failed.' });
		}
	},

	savePrices: async ({ request, params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const pricesJson = formData.get('prices'); // Array of { variantId, usd, zar }

		if (!pricesJson) return fail(400, { message: 'No price data.' });

		let updates = [];
		try {
			updates = JSON.parse(String(pricesJson));
		} catch (e) {
			return fail(400, { message: 'Invalid JSON.' });
		}

		try {
			// Use transaction to ensure consistency
			await db.transaction(async (tx) => {
				// 1. Clear existing prices for this event to handle removals/updates cleanly
				// (Optimized approach: upsert is better, but delete-insert is safer for bulk matrix logic)
				await tx.delete(salePrice).where(eq(salePrice.eventId, params.id));

				// 2. Insert valid entries
				const validEntries = updates
					.filter(u => (u.usd > 0 || u.zar > 0)) // Only save if at least one price is set
					.map(u => ({
						eventId: params.id,
						variantId: u.variantId,
						salePriceUsd: u.usd ? Math.round(u.usd * 100) : null, // Store as Cents
						salePriceZar: u.zar ? Math.round(u.zar * 100) : null  // Store as Cents
					}));

				if (validEntries.length > 0) {
					await tx.insert(salePrice).values(validEntries);
				}
			});

			await log(locals.user.id, 'update_sale_prices', { targetId: params.id, count: updates.length });
			return { success: true, message: 'Pricing matrix saved.' };

		} catch (err) {
			console.error('Price Matrix Error:', err);
			return fail(500, { message: 'Failed to save prices.' });
		}
	},

	delete: async ({ params, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) return fail(403);
		try {
			await db.delete(saleEvent).where(eq(saleEvent.id, params.id));
			await log(locals.user.id, 'delete_sale_event', { targetId: params.id });
			return { success: true, deleted: true }; // Client should redirect
		} catch (e) {
			return fail(500, { message: 'Delete failed.' });
		}
	}
};
