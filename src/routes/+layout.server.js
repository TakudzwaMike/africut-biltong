import { db } from '$lib/server/db';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	const allSettings = await db.query.siteSettings.findMany();
	const settings = allSettings.reduce((acc, setting) => {
		acc[setting.key] = setting.value;
		return acc;
	}, {});

	return {
		user: locals.user,
		settings: {
			siteName: settings.site_name || 'Vision AI Tech',
			logoUrl: settings.site_logo_url || null
		}
	};
}