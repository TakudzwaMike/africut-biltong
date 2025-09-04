import { db } from '$lib/server/db';
import {
	lead as leadTable,
	solution as solutionTable,
	product as productTable,
	location
} from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';

export async function load({ url }) {
	const solutionSlug = url.searchParams.get('solution');
	const productSlug = url.searchParams.get('product');

	const locations = await db.query.location.findMany({
		orderBy: desc(location.countryName)
	});

	let solution = null;
	if (solutionSlug) {
		solution = await db.query.solution.findFirst({
			where: eq(solutionTable.slug, solutionSlug)
		});
	}

	let product = null;
	if (productSlug) {
		product = await db.query.product.findFirst({
			where: eq(productTable.slug, productSlug)
		});
	}

	return { solution, product, locations };
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const { firstName, lastName, email, message, solutionId } = data;

		if (!email || !firstName || !lastName || !message) {
			return fail(400, { data, message: 'All fields are required.' });
		}

		try {
			const valuesToInsert = {
				firstName: String(firstName),
				lastName: String(lastName),
				email: String(email),
				message: String(message),
				solutionId: solutionId ? Number(solutionId) : null
			};

			// First, save the lead to the database
			await db.insert(leadTable).values(valuesToInsert);

			// After successfully saving, send the email notification.
			// We don't await this so the user gets an immediate response.
			sendNewLeadNotification(valuesToInsert);

			return {
				success: true,
				message: "Thank you! We've received your message and will be in touch shortly."
			};
		} catch (error) {
			console.error('Database error on lead submission:', error);
			// For robust error handling, you would log this error to a service like Sentry or Logtail
			return fail(500, { data, message: 'Could not submit your message due to a server error.' });
		}
	}
};