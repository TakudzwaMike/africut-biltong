import { SettingsService } from '$lib/server/services/SettingsService';
import { LocationService } from '$lib/server/services/LocationService';
import { MediaService } from '$lib/server/services/MediaService';

/** @type {import('./$types').LayoutServerLoad} */
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
	if (settings.siteLogoMediaId) {
		logo = await mediaService.getMedia(settings.siteLogoMediaId);
	}

	// Get all media items (for potential reuse/gallery in layout)
	const mediaItems = await mediaService.listMedia();

	return {
		user: locals.user,
		settings: {
			...settings,
			logo: logo
		},
		locations,
		userCountryCode,
		mediaItems
	};

}
