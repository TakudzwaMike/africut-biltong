import { db } from '$lib/server/db';
import { client, media } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const clients = await db.query.client.findMany({
		orderBy: desc(client.id),
		with: {
			logo: true
		}
	});
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { clients, mediaItems };
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const name = formData.get('name');
		const mediaId = formData.get('mediaId');

		if (!name || typeof name !== 'string') {
			return fail(400, { message: 'Client name is required.' });
		}

		const dataToSave = {
			name: String(name),
			mediaId: mediaId ? Number(mediaId) : null
		};

		try {
			if (isNaN(id)) {
				// Create new
				const [newClient] = await db.insert(client).values(dataToSave).returning();
				await log(locals.user?.id, 'create_client', {
					targetId: newClient.id,
					data: newClient
				});
			} else {
				// Update existing
				await db.update(client).set(dataToSave).where(eq(client.id, id));
				await log(locals.user?.id, 'update_client', { targetId: id, data: dataToSave });
			}
			return { success: true, message: 'Client saved successfully.' };
		} catch (error) {
			console.error('Error saving client:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { message: 'A client with this name already exists.' });
			}
			return fail(500, { message: 'Could not save the client.' });
		}
	},

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