import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import { location, media, siteSettings } from '$lib/server/db/schema.js';

/** @type {import('../$types').LayoutServerLoad} */
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

	const mediaItems = await db.query.media.findMany({ orderBy: desc(media.uploadedAt) });

	return {
		user: locals.user,
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			logo: logo, // Keep for initial load
			siteLogoMediaId: settings.site_logo_media_id || null,
			brochureUrl: settings.brochure_url || null,
			heroVideoUrl: settings.hero_video_url || null,
			whatsappNumber: settings.whatsapp_number || null,
			socialLinkedIn: settings.social_linkedin || null,
			socialX: settings.social_x || null,
			socialFacebook: settings.social_facebook || null,
			socialInstagram: settings.social_instagram || 'https://www.instagram.com/visionai.tech?igsh=ZnIxN2p6dWsyazAz',
			socialTikTok: settings.social_tiktok || 'https://www.tiktok.com/@visionaitech?_r=1&_t=ZS-93mGFE3KYvl'
		},
		locations,
		userCountryCode,
		mediaItems // Pass all media items to the client
	};
}
