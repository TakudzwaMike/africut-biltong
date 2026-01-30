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
	// Assuming create/update might be needed later, but only delete was visible in snippet.
	// I will add delete properly.

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
