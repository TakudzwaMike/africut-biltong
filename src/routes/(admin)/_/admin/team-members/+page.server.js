import { fail, error } from '@sveltejs/kit';
import { ALLOWED_ROLES } from '$lib/server/services/AuthService';
import { log } from '$lib/server/services/AuditLogService';
import { TeamService } from '$lib/server/services/TeamService';


const teamService = new TeamService();

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden');
	}

	return {
		teamMembers: await teamService.listTeamMembers()
	};
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const role = formData.get('role');
		const bio = formData.get('bio');
		const photoUrl = formData.get('photoUrl');
		const linkedin = formData.get('linkedin');
		const twitter = formData.get('twitter');

		if (!name || !role) {
			return fail(400, { message: 'Name and Role are required.' });
		}

		try {
			const member = await teamService.createTeamMember(locals.user.id, {
				name: String(name),
				role: String(role),
				bio: String(bio),
				photoUrl: photoUrl ? String(photoUrl) : null,
				linkedin: linkedin ? String(linkedin) : null,
				twitter: twitter ? String(twitter) : null
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