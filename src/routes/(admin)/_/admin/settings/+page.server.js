import { db } from '$lib/server/db';
import { siteSettings, media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';
import { desc, eq } from 'drizzle-orm';

// Helper to get all settings as a simple key-value object
async function getSettings() {
	const allSettings = await db.query.siteSettings.findMany();
	const settingsObj = allSettings.reduce((acc, setting) => {
		acc[setting.key] = setting.value;
		return acc;
	}, {});
	return settingsObj;
}

export async function load() {
	const settings = await getSettings();
	const mediaItems = await db.query.media.findMany({ orderBy: desc(media.uploadedAt) });

	let logo = null;
	const logoId = Number(settings.site_logo_media_id);
	if (!isNaN(logoId)) {
		logo = await db.query.media.findFirst({ where: eq(media.id, logoId) });
	}

	return {
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			brochureUrl: settings.brochure_url || null,
			heroVideoUrl: settings.hero_video_url || '',
			whatsappNumber: settings.whatsapp_number || '',
			siteLogoMediaId: settings.site_logo_media_id || null,
			socialLinkedIn: settings.social_linkedin || '',
			socialInstagram: settings.social_instagram || '',
			socialTikTok: settings.social_tiktok || '',
			socialX: settings.social_x || '',
			socialFacebook: settings.social_facebook || '',
			// NEW: Store Settings
			exchangeRate: settings.exchange_rate_usd_to_zar || '18.50'
		},
		logo,
		mediaItems
	};
}

export const actions = {
	default: async ({ request, locals }) => {
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

		try {
			const dataToLog = {};

			// Helper to upsert a setting
			const saveSetting = async (key, value) => {
				await db
					.insert(siteSettings)
					.values({ key, value: String(value) })
					.onConflictDoUpdate({ target: siteSettings.key, set: { value: String(value) } });
				dataToLog[key] = value;
			};

			// 1. General Settings
			await saveSetting('site_name', siteName);
			await saveSetting('site_logo_media_id', siteLogoMediaId);
			await saveSetting('hero_video_url', heroVideoUrl);
			await saveSetting('whatsapp_number', whatsappNumber);

			// 2. Social Media
			await saveSetting('social_linkedin', socialLinkedIn);
			await saveSetting('social_instagram', socialInstagram);
			await saveSetting('social_tiktok', socialTikTok);
			await saveSetting('social_x', socialX);
			await saveSetting('social_facebook', socialFacebook);

			// 3. Store Settings
			if (exchangeRate) {
				await saveSetting('exchange_rate_usd_to_zar', exchangeRate);
			}

			// 4. Brochure Upload (Special Case)
			if (brochureFile instanceof File && brochureFile.size > 0) {
				const { uploadFile } = await import('$lib/server/blob'); // Dynamic import to avoid S3 init issues on build if keys missing
				// Note: Assuming you use the Blob/S3 helper setup previously. 
				// If using the Vercel Blob helper directly:
				/*
				const { put } = await import('@vercel/blob');
				const blob = await put(brochureFile.name, brochureFile, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN });
				await saveSetting('brochure_url', blob.url);
				*/

				// Using the helper from previous steps (assuming standard buffer upload):
				const buffer = Buffer.from(await brochureFile.arrayBuffer());
				const brochureUrl = await uploadFile(buffer, brochureFile.name, brochureFile.type);
				await saveSetting('brochure_url', brochureUrl);
			}

			await log(locals.user?.id, 'update_site_settings', { data: dataToLog });

			return { success: true, message: 'Settings saved successfully!' };
		} catch (err) {
			console.error('Error saving settings:', err);
			return fail(500, { message: 'Failed to save settings.' });
		}
	}
};