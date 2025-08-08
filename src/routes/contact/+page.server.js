// File: src/routes/contact/+page.server.js
import { PUBLIC_STRAPI_URL } from '$env/static/public';
import { fail } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		try {
			const response = await fetch(`${PUBLIC_STRAPI_URL}/api/leads`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				// Strapi expects the payload to be wrapped in a 'data' object
				body: JSON.stringify({ data })
			});

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Strapi error:', errorData);
				return fail(response.status, { message: 'Failed to submit form.' });
			}

			return { success: true, message: "Thank you! We've received your message and will be in touch shortly." };
		} catch (error) {
			console.error('Network or server error:', error);
			return fail(500, { message: 'Could not connect to the server.' });
		}
	}
};