import { LocationService } from '$lib/server/services/LocationService';
import { SolutionService } from '$lib/server/services/SolutionService';
import { ProductService } from '$lib/server/services/ProductService';
import { LeadService } from '$lib/server/services/LeadService';
import { fail } from '@sveltejs/kit';
import { verifySolution } from '$lib/server/pow';

export async function load({ url }) {
	const solutionSlug = url.searchParams.get('solution');
	const productSlug = url.searchParams.get('product');

	const locationService = new LocationService();
	const locations = await locationService.listLocations();

	let solution = null;
	if (solutionSlug) {
		const solutionService = new SolutionService();
		solution = await solutionService.getSolutionBySlug(solutionSlug);
	}

	let product = null;
	if (productSlug) {
		const productService = new ProductService();
		product = await productService.getProductBySlug(productSlug);
	}

	return { solution, product, locations };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const { firstName, lastName, email, message, solutionId, pow_salt, pow_nonce } = data;

		// 1. Verify Anti-Spam Proof of Work
		const isValidPoW = verifySolution(String(pow_salt), Number(pow_nonce));
		if (!isValidPoW) {
			return fail(400, { data, message: 'Anti-spam verification failed. Please wait a moment and try again.' });
		}

		if (!email || !firstName || !lastName || !message) {
			return fail(400, { data, message: 'All fields are required.' });
		}

		try {
			const leadData = {
				firstName: String(firstName),
				lastName: String(lastName),
				email: String(email),
				message: String(message),
				solutionId: solutionId ? Number(solutionId) : null
			};

			// Use LeadService to create the lead
			const leadService = new LeadService();
			await leadService.createLead(null, leadData); // null userId for public form

			return {
				success: true,
				message: "Thank you! We've received your message and will be in touch shortly."
			};
		} catch (error) {
			console.error('Error on lead submission:', error);
			return fail(500, { data, message: 'Could not submit your message due to a server error.' });
		}
	}
};