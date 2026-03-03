import { fail } from '@sveltejs/kit';
import { SettingsService } from '$lib/server/services/SettingsService';
import { log } from '$lib/server/auditLog';

const settingsService = new SettingsService();

export async function load() {
	return {
		settings: await settingsService.getSettings()
	};
}

export const actions = {
	update: async ({ request, locals }) => {
		const formData = await request.formData();
		const settings = Object.fromEntries(formData);

		try {
			await settingsService.updateSettings(locals.user.id, settings);
			await log(locals.user.id, 'update_settings', { data: settings });
			return { success: true };
		} catch (err) {
			return fail(500, { message: 'Failed to update settings' });
		}
	}
};