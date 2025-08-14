import { db } from '$lib/server/db';
import { client } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export async function load() {
	const clients = await db.query.client.findMany({
		orderBy: desc(client.id)
	});
	return { clients };
}

export const actions = {
	delete: async ({ url }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			// Note: S3 objects are not deleted from storage automatically.
			// A more robust implementation would also delete the logo from Minio.
			await db.delete(client).where(eq(client.id, Number(id)));
		} catch (error) {
			return fail(500, { message: 'Could not delete the client.' });
		}

		return {
			status: 200
		};
	}
};