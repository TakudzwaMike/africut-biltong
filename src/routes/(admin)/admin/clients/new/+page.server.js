import { db } from '$lib/server/db';
import { client } from '$lib/server/db/schema.js';
import { fail, redirect } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const logoFile = formData.get('logo');

		if (!name || typeof name !== 'string') {
			return fail(400, { name, message: 'Client name is required.' });
		}

		let logoUrl = null;

		if (logoFile instanceof File && logoFile.size > 0) {
			try {
				const buffer = Buffer.from(await logoFile.arrayBuffer());
				logoUrl = await uploadFile(buffer, logoFile.name, logoFile.type);
			} catch (error) {
				console.error('Blob Upload Error:', error);
				return fail(500, { name, message: 'Failed to upload logo.' });
			}
		}

		try {
			const [newClient] = await db
				.insert(client)
				.values({
					name,
					logoUrl
				})
				.returning();

			await log(locals.user?.id, 'create_client', {
				targetId: newClient.id,
				data: newClient
			});
		} catch (error) {
			console.error('Database Insert Error:', error);
			if (error.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, { name, message: 'A client with this name already exists.' });
			}
			return fail(500, { name, message: 'Could not create the client.' });
		}

		throw redirect(302, '/admin/clients');
	}
};