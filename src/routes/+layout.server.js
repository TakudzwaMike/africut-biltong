import { db } from '$lib/server/db';
import { desc } from 'drizzle-orm';
import { location } from '$lib/server/db/schema.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, request }) {
	const allSettings = await db.query.siteSettings.findMany();
	const settings = allSettings.reduce((acc, setting) => {
		acc[setting.key] = setting.value;
		return acc;
	}, {});

	// Correctly query locations ordered by country name
	const locations = await db.query.location.findMany({
		orderBy: desc(location.countryName)
	});

	// Get the user's country code from Vercel's header, with a fallback to 'ZA' for local dev
	const userCountryCode = request.headers.get('x-vercel-ip-country') || 'ZA';

	return {
		user: locals.user,
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			logoUrl: settings.site_logo_url || null
		},
		locations,
		userCountryCode
	};
}