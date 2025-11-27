import { db } from '$lib/server/db';
import { saleEvent } from '$lib/server/db/schema';
import { fail, redirect, error } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog';

const ALLOWED_ROLES = ['admin', 'store_manager'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}
	return {};
}

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const publicLabel = formData.get('publicLabel');
		const startsAt = formData.get('startsAt');
		const endsAt = formData.get('endsAt');

		if (!name || !startsAt || !endsAt) {
			return fail(400, { message: 'Name and Dates are required.' });
		}

		try {
			const [newEvent] = await db.insert(saleEvent).values({
				name: String(name),
				publicLabel: publicLabel ? String(publicLabel) : null,
				startsAt: new Date(String(startsAt)),
				endsAt: new Date(String(endsAt)),
				isActive: false // Default to inactive so prices can be set first
			}).returning();

			await log(locals.user.id, 'create_sale_event', {
				targetId: newEvent.id,
				data: { name: newEvent.name }
			});

			throw redirect(303, `/_/admin/marketing/events/${newEvent.id}`);

		} catch (err) {
			// Rethrow redirect to let SvelteKit handle it
			if (err.status === 303) throw err;
			
			console.error('Error creating sale event:', err);
			return fail(500, { message: 'Could not create event.' });
		}
	}
};
