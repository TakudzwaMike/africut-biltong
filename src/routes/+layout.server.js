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

	let logo = null;
	const logoId = Number(settings.site_logo_media_id);
	if (!isNaN(logoId)) {
		logo = await db.query.media.findFirst({ where: eq(media.id, logoId) });
	}

	return {
		user: locals.user,
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			logo: logo,
			brochureUrl: settings.brochure_url || null,
			heroVideoUrl: settings.hero_video_url || null,
			whatsappNumber: settings.whatsapp_number || null,
			socialLinkedIn: settings.social_linkedin || null,
			socialX: settings.social_x || null,
			socialFacebook: settings.social_facebook || null
		},
		locations,
		userCountryCode
	};
}