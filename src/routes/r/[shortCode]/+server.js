import { db } from '$lib/server/db';
import { trackedLink, linkVisit } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export async function GET({ params, request }) {
	const { shortCode } = params;
	console.log(`--- [TRACKED LINK] ---`);
	console.log(`Received request for shortCode: "${shortCode}"`);


	if (!shortCode) {
		console.log(`No shortCode provided. Redirecting to homepage.`);
		throw redirect(307, '/');
	}

	console.log(`Querying database for shortCode: "${shortCode}"`);
	const link = await db.query.trackedLink.findFirst({
		where: eq(trackedLink.shortCode, shortCode)
	});

	if (!link) {
		console.log(`No link found in database for shortCode: "${shortCode}". Redirecting to homepage.`);
		throw redirect(307, '/');
	}

	try {
		const ipCountry = request.headers.get('x-vercel-ip-country');
		await db.insert(linkVisit).values({
			linkId: link.id,
			ipCountry: ipCountry
		});
	} catch (err) {
		console.error('Failed to log link visit:', err);
	}

	throw redirect(307, link.destinationUrl);
}