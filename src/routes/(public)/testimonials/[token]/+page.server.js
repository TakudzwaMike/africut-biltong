import { PartnerService } from '$lib/server/services/PartnerService';
import { fail, error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const { token } = params;

	const partnerService = new PartnerService();
	const request = await partnerService.getTestimonialByToken(token);

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
			const partnerService = new PartnerService();
			await partnerService.submitTestimonial(token, {
				quote: String(quote),
				authorName: String(authorName),
				authorTitle: String(authorTitle)
			});
		} catch (err) {
			console.error('Testimonial submission error:', err);
			if (err.message && err.message.includes('invalid')) {
				return fail(404, { data, message: err.message });
			}
			return fail(500, { data, message: 'Could not submit your testimonial.' });
		}

		throw redirect(302, '/testimonials/thank-you');
	}
};