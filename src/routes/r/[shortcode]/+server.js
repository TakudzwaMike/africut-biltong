import { db } from '$lib/server/db';
import { trackedLink, linkVisit } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, request }) {
	const { shortCode } = params;

	if (!shortCode) {
		// Redirect to homepage if no code is provided
		throw redirect(307, '/');
	}

	// Find the link in the database
	const link = await db.query.trackedLink.findFirst({
		where: eq(trackedLink.shortCode, shortCode)
	});

	if (!link) {
		// Redirect to homepage if the code is invalid
		throw redirect(307, '/');
	}

	// Log the visit asynchronously (don't make the user wait)
	const ipCountry = request.headers.get('x-vercel-ip-country');
	db.insert(linkVisit)
		.values({
			linkId: link.id,
			ipCountry: ipCountry
		})
		.then(() => {
			// Successfully logged
		})
		.catch((err) => {
			// Log error but don't block redirect
			console.error('Failed to log link visit:', err);
		});

	// Redirect the user to the final destination
	throw redirect(307, link.destinationUrl);
}