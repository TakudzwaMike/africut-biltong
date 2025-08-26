import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/blob';
import { log } from '$lib/server/auditLog.js';

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
	return {
		siteName: settings.site_name || 'Vision AI Tech',
		logoUrl: settings.site_logo_url || null,
		brochureUrl: settings.brochure_url || null,
		heroVideoUrl: settings.hero_video_url || null
	};
}

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const siteName = formData.get('siteName');
		const logoFile = formData.get('logo');
		const brochureFile = formData.get('brochure');
		const heroVideoUrl = formData.get('heroVideoUrl');
		if (!siteName || typeof siteName !== 'string') {
			return fail(400, { message: 'Site name is required.' });
		}

		try {
			const dataToLog = {};
			
			// Upsert site name (insert or update if it exists)
			await db
				.insert(siteSettings)
				.values({ key: 'site_name', value: siteName })
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: { value: siteName }
				});
			dataToLog.site_name = siteName;

			// Handle logo upload
			if (logoFile instanceof File && logoFile.size > 0) {
				const buffer = Buffer.from(await logoFile.arrayBuffer());
				const logoUrl = await uploadFile(buffer, logoFile.name, logoFile.type);

				// Upsert logo URL
				await db
					.insert(siteSettings)
					.values({ key: 'site_logo_url', value: logoUrl })
					.onConflictDoUpdate({
						target: siteSettings.key,
						set: { value: logoUrl }
					});
				dataToLog.site_logo_url = logoUrl;
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

			await log(locals.user?.id, 'update_site_settings', { data: dataToLog });

			return { success: true, message: 'Settings saved successfully!' };
		} catch (err) {
			console.error('Error saving settings:', err);
			return fail(500, { message: 'Failed to save settings.' });
		}
	}
};
