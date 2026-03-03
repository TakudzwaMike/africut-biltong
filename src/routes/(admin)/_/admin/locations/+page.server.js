import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { LocationService } from '$lib/server/services/LocationService';

const locationService = new LocationService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	return {
		locations: await locationService.listLocations()
	};
}

export const actions = {
	save: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}
		const raw = Object.fromEntries(await request.formData());

		// Strip empty strings so optional/auto-generated fields don't crash Postgres
		const data = {};
		for (const [key, value] of Object.entries(raw)) {
			if (value !== '') data[key] = value;
		}
		// Remove id for new records (it comes as empty from the hidden input)
		if (!data.id) delete data.id;

		try {
			await locationService.createLocation(locals.user.id, data);
			await log(locals.user?.id, 'save_location', { data });
			return { success: true, message: 'Location saved successfully!' };
		} catch (err) {
			return fail(500, { message: 'Could not save the location.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			await locationService.deleteLocation(locals.user.id, Number(id));

			await log(locals.user?.id, 'delete_location', { targetId: id });

			return { success: true, message: 'Location deleted successfully!' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the location.' });
		}
	}
};
