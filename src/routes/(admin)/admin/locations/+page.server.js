import { db } from '$lib/server/db';
import { location } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const locations = await db.query.location.findMany({
		orderBy: desc(location.id)
	});
	return { locations };
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const { countryName, countryCode, address, phoneNumber, latitude, longitude } =
			Object.fromEntries(formData);

		if (!countryName || !countryCode || !address) {
			return fail(400, { message: 'All fields are required.' });
		}
		if (typeof countryCode !== 'string' || countryCode.length !== 2) {
			return fail(400, { message: 'Country Code must be 2 characters (e.g., ZW).' });
		}

		const dataToSave = {
			countryName: String(countryName),
			countryCode: String(countryCode).toUpperCase(),
			address: String(address),
			phoneNumber: String(phoneNumber),
			latitude: String(latitude),
			longitude: String(longitude)
		};

		try {
			if (isNaN(id)) {
				// Create new location
				const [newLocation] = await db.insert(location).values(dataToSave).returning();
				await log(locals.user?.id, 'create_location', {
					targetId: newLocation.id,
					data: newLocation
				});
			} else {
				// Update existing location
				await db.update(location).set(dataToSave).where(eq(location.id, id));
				await log(locals.user?.id, 'update_location', { targetId: id, data: dataToSave });
			}
			return { success: true, message: 'Location saved successfully!' };
		} catch (error) {
			console.error('Error saving location:', error);
			return fail(500, { message: 'Could not save location.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const locToDelete = await db.query.location.findFirst({ where: eq(location.id, Number(id)) });

			if (!locToDelete) {
				return fail(404, { message: 'Location not found.' });
			}

			await db.delete(location).where(eq(location.id, Number(id)));
			await log(locals.user?.id, 'delete_location', { targetId: id, data: locToDelete });

			return { success: true, message: 'Location deleted successfully!' };
		} catch (error) {
			console.error('Error deleting location:', error);

			return fail(500, { message: 'Could not delete the location.' });
		}
	}
};
