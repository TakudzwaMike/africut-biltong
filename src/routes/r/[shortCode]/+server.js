import { db } from '$lib/server/db';
import { trackedLink, linkVisit } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, request }) {
	const { shortCode } = params;
	console.log(`--- [TRACKED LINK] ---`);
	console.log(`Received request for shortCode: "${shortCode}"`);


	if (!shortCode) {
		// Redirect to homepage if no code is provided
		console.log(`No shortCode provided. Redirecting to homepage.`);
		throw redirect(307, '/');
	}

	// Find the link in the database
	console.log(`Querying database for shortCode: "${shortCode}"`);
	const link = await db.query.trackedLink.findFirst({
		where: eq(trackedLink.shortCode, shortCode)
	});

	if (!link) {
		console.log(`No link found in database for shortCode: "${shortCode}". Redirecting to homepage.`);
		// Redirect to homepage if the code is invalid
		throw redirect(307, '/');
	}

	// Log the visit and wait for it to complete before redirecting.
	try {
		const ipCountry = request.headers.get('x-vercel-ip-country');
		await db.insert(linkVisit).values({
			linkId: link.id,
			ipCountry: ipCountry
		});
	} catch (err) {
		// Log the error but do not block the user's redirect.
		console.error('Failed to log link visit:', err);
	}

	// Redirect the user to the final destination.
	throw redirect(307, link.destinationUrl);
}