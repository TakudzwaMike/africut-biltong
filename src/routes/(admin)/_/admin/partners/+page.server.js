import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { PartnerService } from '$lib/server/services/PartnerService';
import { MediaService } from '$lib/server/services/MediaService';


const partnerService = new PartnerService();
const mediaService = new MediaService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const [clients, mediaItems] = await Promise.all([
		partnerService.listPartners(),
		mediaService.listMedia()
	]);

	return {
		clients,
		mediaItems
	};
}

export const actions = {
	save: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const id = formData.get('id');
		const name = formData.get('name');
		const mediaId = formData.get('mediaId');

		if (!name) return fail(400, { message: 'Name is required' });

		try {
			if (id) {
				await partnerService.updatePartner(locals.user.id, Number(id), {
					name: String(name),
					mediaId: mediaId ? Number(mediaId) : null
				});
				await log(locals.user.id, 'update_client', { targetId: id, data: { name } });
				return { success: true, message: 'Partner updated successfully.' };
			} else {
				const partner = await partnerService.createPartner(locals.user.id, {
					name: String(name),
					mediaId: mediaId ? Number(mediaId) : null
				});
				await log(locals.user.id, 'create_client', { targetId: partner.id, data: { name } });
				return { success: true, message: 'Partner added successfully.' };
			}
		} catch (err) {
			return fail(500, { message: 'Failed to save partner.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			await partnerService.deletePartner(locals.user.id, Number(id));

			await log(locals.user?.id, 'delete_client', { targetId: id });

			return { success: true, message: 'Client deleted successfully.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete the client.' });
		}
	}
};
