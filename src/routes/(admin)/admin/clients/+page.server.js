import { db } from '$lib/server/db';
import { client } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const clients = await db.query.client.findMany({
		orderBy: desc(client.id)
	});
	return { clients };
}

export const actions = {
	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const clientToDelete = await db.query.client.findFirst({
				where: eq(client.id, Number(id))
			});

			if (!clientToDelete) {
				return fail(404, { message: 'Client not found.' });
			}
			
			// Note: Blob objects are not deleted from storage automatically.
			await db.delete(client).where(eq(client.id, Number(id)));

			await log(locals.user?.id, 'delete_client', {
				targetId: id,
				data: clientToDelete
			});
			
			return { status: 200, message: 'Client deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the client.' });
		}
	}
};