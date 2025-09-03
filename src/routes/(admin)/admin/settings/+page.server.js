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
			// Pass social links as part of the settings object for consistency
			socialLinkedIn: settings.social_linkedin || '',
			socialX: settings.social_x || '',
			socialFacebook: settings.social_facebook || ''
		},
		logo,
		mediaItems
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const siteName = formData.get('siteName');
		const brochureFile = formData.get('brochure');
		const heroVideoUrl = formData.get('heroVideoUrl');
		const whatsappNumber = formData.get('whatsappNumber');
		const siteLogoMediaId = formData.get('siteLogoMediaId');
		const socialLinkedIn = formData.get('socialLinkedIn');
		const socialX = formData.get('socialX');
		const socialFacebook = formData.get('socialFacebook');

		if (!siteName || typeof siteName !== 'string') {
			return fail(400, { message: 'Site name is required.' });
		}

		try {
			const dataToLog = {};

			// Upsert site name
			await db
				.insert(siteSettings)
				.values({ key: 'site_name', value: siteName })
				.onConflictDoUpdate({ target: siteSettings.key, set: { value: siteName } });
			dataToLog.site_name = siteName;
			
			// Upsert site logo media ID
			await db
				.insert(siteSettings)
				.values({ key: 'site_logo_media_id', value: String(siteLogoMediaId) })
				.onConflictDoUpdate({ target: siteSettings.key, set: { value: String(siteLogoMediaId) } });
			dataToLog.site_logo_media_id = siteLogoMediaId;

			// Handle brochure upload (still a direct upload for now)
			if (brochureFile instanceof File && brochureFile.size > 0) {
				const { uploadFile } = await import('$lib/server/blob');
				const buffer = Buffer.from(await brochureFile.arrayBuffer());
				const brochureUrl = await uploadFile(buffer, brochureFile.name, brochureFile.type);
				await db
					.insert(siteSettings)
					.values({ key: 'brochure_url', value: brochureUrl })
					.onConflictDoUpdate({ target: siteSettings.key, set: { value: brochureUrl } });
				dataToLog.brochure_url = brochureUrl;
			}
			// Handle brochure upload
			if (brochureFile instanceof File && brochureFile.size > 0) {
				const buffer = Buffer.from(await brochureFile.arrayBuffer());
				// Use the original filename for the brochure
				const brochureUrl = await uploadFile(buffer, brochureFile.name, brochureFile.type);

				// Upsert brochure URL
				await db
					.insert(siteSettings)
					.values({ key: 'brochure_url', value: brochureUrl })
					.onConflictDoUpdate({
						target: siteSettings.key,
						set: { value: brochureUrl }
					});
				dataToLog.brochure_url = brochureUrl;
			}

			// Upsert Hero Video URL
			await db
				.insert(siteSettings)
				.values({ key: 'hero_video_url', value: String(heroVideoUrl) })
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: { value: String(heroVideoUrl) }
				});
			dataToLog.hero_video_url = heroVideoUrl;

			await db
				.insert(siteSettings)
				.values({ key: 'whatsapp_number', value: String(whatsappNumber) })
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: { value: String(whatsappNumber) }
				});
			dataToLog.whatsapp_number = whatsappNumber;

			// Upsert Social Links
			const socialLinks = {
				social_linkedin: String(socialLinkedIn),
				social_x: String(socialX),
				social_facebook: String(socialFacebook)
			};

			for (const [key, value] of Object.entries(socialLinks)) {
				await db
					.insert(siteSettings)
					.values({ key, value })
					.onConflictDoUpdate({ target: siteSettings.key, set: { value } });
				dataToLog[key] = value;
			}

			await log(locals.user?.id, 'update_site_settings', { data: dataToLog });

			return { success: true, message: 'Settings saved successfully!' };
		} catch (err) {
			console.error('Error saving settings:', err);
			return fail(500, { message: 'Failed to save settings.' });
		}
	}
};
