import { fail } from '@sveltejs/kit';
import { SettingsService } from '$lib/server/services/SettingsService';
import { log } from '$lib/server/auditLog';
import { MediaService } from '$lib/server/services/MediaService';
import { WiseService } from '$lib/server/services/WiseService';

const settingsService = new SettingsService();
const mediaService = new MediaService();

export async function load() {
	const settings = await settingsService.getSettings();
	const mediaItems = await mediaService.listMedia();

	let logo = null;
	if (settings.siteLogoMediaId) {
		logo = await mediaService.getMedia(settings.siteLogoMediaId);
	}

	// Fetch Live Wise Rate
	const wiseService = new WiseService();
	let liveWiseRate = null;
	try {
		liveWiseRate = await wiseService.getRate('USD', 'ZAR');
	} catch (e) {
		console.error('Failed to fetch live Wise rate in Admin Settings', e);
	}

	return {
		settings,
		logo,
		mediaItems,
		liveWiseRate
	};
}

export const actions = {
	update: async ({ request, locals }) => {
		const formData = await request.formData();

		// Extract Fields
		const siteName = formData.get('siteName');
		const brochureFile = formData.get('brochure');
		const heroVideoUrl = formData.get('heroVideoUrl');
		const whatsappNumber = formData.get('whatsappNumber');
		const siteLogoMediaId = formData.get('siteLogoMediaId');
		const socialLinkedIn = formData.get('socialLinkedIn');
		const socialInstagram = formData.get('socialInstagram');
		const socialTikTok = formData.get('socialTikTok');
		const socialX = formData.get('socialX');
		const socialFacebook = formData.get('socialFacebook');
		const exchangeRate = formData.get('exchangeRate');

		if (!siteName || typeof siteName !== 'string') {
			return fail(400, { message: 'Site name is required.' });
		}

		const settings = {
			siteName,
			heroVideoUrl,
			whatsappNumber,
			siteLogoMediaId: siteLogoMediaId ? Number(siteLogoMediaId) : null,
			/** @type {string | null} */
			brochureUrl: null, // Initialize to allow later assignment
			socialLinkedIn,
			socialX,
			socialFacebook,
			socialInstagram,
			socialTikTok,
			exchangeRate
		};

		try {
			// 1. Brochure Upload (Special Case)
			if (brochureFile instanceof File && brochureFile.size > 0) {
				const { uploadFile } = await import('$lib/server/blob');
				const buffer = Buffer.from(await brochureFile.arrayBuffer());
				const brochureUrl = await uploadFile(buffer, brochureFile.name, brochureFile.type);
				settings.brochureUrl = brochureUrl;
			}

			const userId = locals.user?.id || 'system';
			await settingsService.updateSettings(userId, settings);
			await log(userId, 'update_site_settings', { data: settings });

			return { success: true, message: 'Settings saved successfully!' };

		} catch (err) {
			console.error('Settings update error:', err);
			return fail(500, { message: 'Failed to update settings' });
		}
	}
};