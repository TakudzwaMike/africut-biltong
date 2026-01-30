import { SettingsService } from '$lib/server/services/SettingsService';
import { LocationService } from '$lib/server/services/LocationService';
import { MediaService } from '$lib/server/services/MediaService';

/** @type {import('../$types').LayoutServerLoad} */
export async function load({ locals, request }) {
	const settingsService = new SettingsService();
	const locationService = new LocationService();
	const mediaService = new MediaService();

	// Get all settings
	const settings = await settingsService.getSettings();

	// Get locations
	const locations = await locationService.listLocations();

	// Get user's country code from Vercel's header, with fallback to 'ZA' for local dev
	const userCountryCode = request.headers.get('x-vercel-ip-country') || 'ZA';

	// Get logo media if configured
	let logo = null;
	const logoId = Number(settings.site_logo_media_id);
	if (!isNaN(logoId)) {
		logo = await mediaService.getMedia(logoId);
	}

	// Get all media items
	const mediaItems = await mediaService.listMedia();

	return {
		user: locals.user,
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			logo: logo,
			siteLogoMediaId: settings.site_logo_media_id || null,
			brochureUrl: settings.brochure_url || null,
			heroVideoUrl: settings.hero_video_url || null,
			whatsappNumber: settings.whatsapp_number || null,
			socialLinkedIn: settings.social_linkedin || null,
			socialX: settings.social_x || null,
			socialFacebook: settings.social_facebook || null
		},
		locations,
		userCountryCode,
		mediaItems
	};
}
