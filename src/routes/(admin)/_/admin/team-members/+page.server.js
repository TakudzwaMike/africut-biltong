import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { TeamService } from '$lib/server/services/TeamService';
import { MediaService } from '$lib/server/services/MediaService';


const teamService = new TeamService();
const mediaService = new MediaService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	const [teamMembers, mediaItems] = await Promise.all([
		teamService.listTeamMembers(),
		mediaService.listMedia()
	]);

	return {
		teamMembers,
		mediaItems
	};
}

export const actions = {
	save: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const title = formData.get('title') || formData.get('role'); // Fallback during transition
		const bio = formData.get('bio');
		const mediaId = formData.get('mediaId');

		if (!name || !title) {
			return fail(400, { message: 'Name and Title are required.' });
		}

		try {
			const member = await teamService.createTeamMember(locals.user.id, {
				name: String(name),
				title: String(title),
				bio: bio ? String(bio) : null,
				mediaId: mediaId ? Number(mediaId) : null
			});

			await log(locals.user.id, 'create_team_member', { targetId: member.id, data: { name } });
			return { success: true, message: 'Team member added.' };
		} catch (err) {
			return fail(500, { message: 'Failed to add team member.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) return fail(400, { message: 'Invalid request' });

		try {
			await teamService.deleteTeamMember(locals.user.id, Number(id));

			await log(locals.user.id, 'delete_team_member', { targetId: id });

			return { success: true, message: 'Team member deleted.' };
		} catch (error) {
			return fail(500, { message: 'Could not delete team member.' });
		}
	}
};