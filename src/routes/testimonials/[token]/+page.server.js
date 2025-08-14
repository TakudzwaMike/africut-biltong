import { db } from '$lib/server/db';
import { testimonial } from '$lib/server/db/schema.js';
import { fail, error, redirect } from '@sveltejs/kit';
import { and, eq, gt } from 'drizzle-orm';

export async function load({ params }) {
	const { token } = params;

	const request = await db.query.testimonial.findFirst({
		where: and(
			eq(testimonial.submissionToken, token),
			eq(testimonial.status, 'pending'),
			gt(testimonial.tokenExpiresAt, new Date())
		),
		with: {
			client: true
		}
	});

	if (!request) {
		throw error(404, 'This testimonial link is invalid or has expired.');
	}

	return { clientName: request.client.name };
}

export const actions = {
	default: async ({ request, params }) => {
		const { token } = params;
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const { quote, authorName, authorTitle } = data;

		if (!quote || !authorName || !authorTitle) {
			return fail(400, { data, message: 'All fields are required.' });
		}

		try {
			const [updatedRequest] = await db
				.update(testimonial)
				.set({
					quote: String(quote),
					authorName: String(authorName),
					authorTitle: String(authorTitle),
					status: 'submitted'
				})
				.where(eq(testimonial.submissionToken, token))
				.returning();

			if (!updatedRequest) {
				return fail(404, {
					data,
					message: 'This testimonial link is invalid or has expired.'
				});
			}
		} catch (err) {
			console.error('Testimonial submission error:', err);
			return fail(500, { data, message: 'Could not submit your testimonial.' });
		}

		throw redirect(302, '/testimonials/thank-you');
	}
};