import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { uploadFile } from '$lib/server/blob';

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
		logoUrl: settings.site_logo_url || null
	};
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const siteName = formData.get('siteName');
		const logoFile = formData.get('logo');

		if (!siteName || typeof siteName !== 'string') {
			return fail(400, { message: 'Site name is required.' });
		}

		try {
			// Upsert site name (insert or update if it exists)
			await db
				.insert(siteSettings)
				.values({ key: 'site_name', value: siteName })
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: { value: siteName }
				});

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
			}

			return { success: true, message: 'Settings saved successfully!' };
		} catch (err) {
			console.error('Error saving settings:', err);
			return fail(500, { message: 'Failed to save settings.' });
		}
	}
};