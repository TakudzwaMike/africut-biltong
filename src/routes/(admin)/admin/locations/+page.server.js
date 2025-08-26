import { db } from '$lib/server/db';
import { location } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

export async function load() {
	const locations = await db.query.location.findMany({
		orderBy: desc(location.id)
	});
	return { locations };
}

export const actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { 
			countryName,
			countryCode,
			address,
			phoneNumber,
			latitude,
			longitude
		} = data;

		if (!countryName || !countryCode || !address ) {
			return fail(400, { data, message: 'All fields are required.' });
		}

		if (typeof countryCode !== 'string' || countryCode.length !== 2) {
			return fail(400, { data, message: 'Country Code must be 2 characters (e.g., ZW).' });
		}

		try {
			const newLocation = {
				countryName: String(countryName),
				countryCode: String(countryCode).toUpperCase(),
				address: String(address),
				phoneNumber: String(phoneNumber)
				latitude: String(latitude),
				longitude: String(longitude)
			}

			await db.insert(location).values(newLocation);
			await log(locals.user?.id, 'create_location', { data: newLocation });

			return { success: true, message: 'Location added successfully!' };
		} catch (error) {
			console.error('Error creating location:', error);
			return fail(500, { data, message: 'Could not create the location.' });
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
