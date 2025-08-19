import { db } from '$lib/server/db';
import { client, testimonial } from '$lib/server/db/schema.js';
import { fail, error } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { uploadFile } from '$lib/server/blob';
import crypto from 'crypto';
import { log } from '$lib/server/auditLog.js';

export async function load({ params }) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(404, 'Not found');
	}

	const foundClient = await db.query.client.findFirst({
		where: eq(client.id, id),
		with: {
			testimonials: {
				orderBy: desc(testimonial.id)
			}
		}
	});

	if (!foundClient) {
		throw error(404, 'Client not found');
	}

	return { client: foundClient };
}

export const actions = {
	updateClient: async ({ request, params, locals }) => {
		const id = Number(params.id);
		const formData = await request.formData();
		const name = formData.get('name');
		const logoFile = formData.get('logo');

		if (!name || typeof name !== 'string') {
			return fail(400, { form: 'updateClient', name, message: 'Client name is required.' });
		}

		const dataToUpdate = { name };

		if (logoFile instanceof File && logoFile.size > 0) {
			try {
				const buffer = Buffer.from(await logoFile.arrayBuffer());
				dataToUpdate.logoUrl = await uploadFile(buffer, logoFile.name, logoFile.type);
				console.log(dataToUpdate);
			} catch (err) {
				console.error('Blob Upload Error:', err);
				return fail(500, { form: 'updateClient', name, message: 'Failed to upload new logo.' });
			}
		}

		try {
			await db.update(client).set(dataToUpdate).where(eq(client.id, id));

			await log(locals.user?.id, 'update_client', {
				targetId: id,
				data: dataToUpdate
			});
		} catch (err) {
			console.error('Database Update Error:', err);
			if (err.message.includes('duplicate key value violates unique constraint')) {
				return fail(400, {
					form: 'updateClient',
					name,
					message: 'A client with this name already exists.'
				});
			}
			return fail(500, { form: 'updateClient', name, message: 'Could not update the client.' });
		}

		return { success: true, form: 'updateClient' };
	},

	generateLink: async ({ params }) => {
		const clientId = Number(params.id);
		const token = crypto.randomBytes(32).toString('hex');
		const expires = new Date();
		expires.setDate(expires.getDate() + 7); // Link is valid for 7 days

		let newTestimonial;
		try {
			[newTestimonial] = await db
				.insert(testimonial)
				.values({
					clientId,
					submissionToken: token,
					tokenExpiresAt: expires
				})
				.returning();
		} catch (error) {
			console.error('Error generating testimonial link:', error);
			return fail(500, { form: 'generateLink', message: 'Failed to generate a new link.' });
		}

		return { success: true, form: 'generateLink', newTestimonial };
	},

	deleteTestimonial: async ({ request }) => {
		const formData = await request.formData();
		const testimonialId = Number(formData.get('testimonialId'));

		if (!testimonialId || isNaN(testimonialId)) {
			return fail(400, { form: 'deleteTestimonial', message: 'Invalid request.' });
		}

		try {
			await db.delete(testimonial).where(eq(testimonial.id, testimonialId));
		} catch (error) {
			console.error('Error deleting testimonial:', error);
			return fail(500, { form: 'deleteTestimonial', message: 'Failed to delete testimonial.' });
		}

		return { success: true, form: 'deleteTestimonial' };
	}
};