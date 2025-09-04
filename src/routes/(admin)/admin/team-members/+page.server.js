import { db } from '$lib/server/db';
import { teamMember, media } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const teamMembers = await db.query.teamMember.findMany({
		orderBy: desc(teamMember.id),
		with: {
			photo: true
		}
	});
	const mediaItems = await db.query.media.findMany({
		orderBy: desc(media.uploadedAt)
	});
	return { teamMembers, mediaItems };
}

export const actions = {
	save: async ({ request, locals }) => {
		const formData = await request.formData();
		const idRaw = formData.get('id');
		const id = idRaw ? parseInt(String(idRaw), 10) : null; // Correctly parse ID
		const name = formData.get('name');
		const title = formData.get('title');
		const bio = formData.get('bio');
		const mediaIdRaw = formData.get('mediaId');

		if (!name || !title) {
			return fail(400, { message: 'Name and Title are required.' });
		}

		const parsedMediaId = mediaIdRaw ? parseInt(String(mediaIdRaw), 10) : NaN;

		const dataToSave = {
			name: String(name),
			title: String(title),
			bio: String(bio),
			mediaId: !isNaN(parsedMediaId) ? parsedMediaId : null
		};

		try {
			if (id) {
				// Update existing: if ID is a truthy value (i.e., not null, not 0)
				await db.update(teamMember).set(dataToSave).where(eq(teamMember.id, id));
				await log(locals.user?.id, 'update_team_member', {
					targetId: id,
					data: dataToSave
				});
			} else {
				// Create new
				const [newMember] = await db.insert(teamMember).values(dataToSave).returning();
				await log(locals.user?.id, 'create_team_member', {
					targetId: newMember.id,
					data: newMember
				});
			}
			return { success: true, message: 'Team member saved.' };
		} catch (error) {
			console.error('Error saving team member:', error);
			return fail(500, { message: 'Could not save team member.' });
		}
	},

	delete: async ({ url, locals }) => {
		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const memberToDelete = await db.query.teamMember.findFirst({
				where: eq(teamMember.id, Number(id))
			});
			if (!memberToDelete) {
				return fail(404, { message: 'Team member not found.' });
			}

			await db.delete(teamMember).where(eq(teamMember.id, Number(id)));

			await log(locals.user?.id, 'delete_team_member', {
				targetId: id,
				data: memberToDelete
			});

			return { success: true, message: 'Team member deleted.' };
		} catch (error) {
			console.error('Error deleting team member:', error);
			return fail(500, { message: 'Could not delete team member.' });
		}
	}
};