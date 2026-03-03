import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { MarketingService } from '$lib/server/services/MarketingService';


const marketingService = new MarketingService();

export async function load({ params, locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const { id } = params;

	try {
		const result = await marketingService.getEventWithPrices(id);
		return result; // Returns { event, products, priceMap }
	} catch (e) {
		throw error(404, 'Event not found');
	}
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
			const updateData = {
				name: String(name),
				publicLabel: String(publicLabel),
				startsAt: new Date(String(startsAt)),
				endsAt: new Date(String(endsAt)),
				isActive
			};

			await marketingService.updateEvent(locals.user.id, params.id, updateData);

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
			await marketingService.updateEventPrices(locals.user.id, params.id, updates);

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
			await marketingService.deleteEvent(locals.user.id, params.id);
			await log(locals.user.id, 'delete_sale_event', { targetId: params.id });
			return { success: true, deleted: true }; // Client should redirect
		} catch (e) {
			return fail(500, { message: 'Delete failed.' });
		}
	}
};
