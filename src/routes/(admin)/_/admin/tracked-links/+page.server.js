import { db } from '$lib/server/db';
import { trackedLink } from '$lib/server/db/schema.js';
import { fail, error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);
const ALLOWED_ROLES = ['admin', 'content_editor'];

export async function load({ locals }) {
	if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
		throw error(403, 'Forbidden: You do not have permission to manage tracked links.');
	}

	const links = await db.query.trackedLink.findMany({
		orderBy: desc(trackedLink.createdAt),
		with: {
			user: {
				columns: {
					username: true
				}
			},
			visits: {
				columns: {
					id: true
				}
			}
		}
	});
	return { links };
}

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const formData = await request.formData();
		const destinationUrl = formData.get('destinationUrl');
		const description = formData.get('description');

		if (!destinationUrl || typeof destinationUrl !== 'string') {
			return fail(400, { message: 'Destination URL is required.' });
		}

		try {
			const shortCode = nanoid();
			const newLink = {
				shortCode,
				destinationUrl: String(destinationUrl),
				description: String(description),
				userId: locals.user.id
			};

			const [createdLink] = await db.insert(trackedLink).values(newLink).returning();

			await log(locals.user?.id, 'create_tracked_link', {
				targetId: createdLink.id,
				data: createdLink
			});

			return { success: true, message: 'Tracked link created successfully.' };
		} catch (error) {
			console.error('Error creating tracked link:', error);
			return fail(500, { message: 'Could not create tracked link.' });
		}
	},

	delete: async ({ url, locals }) => {
		if (!locals.user || !ALLOWED_ROLES.includes(locals.user.role)) {
			return fail(403, { message: 'Unauthorized.' });
		}

		const id = url.searchParams.get('id');
		if (!id) {
			return fail(400, { message: 'Invalid request' });
		}

		try {
			const linkToDelete = await db.query.trackedLink.findFirst({
				where: eq(trackedLink.id, Number(id))
			});
			if (!linkToDelete) {
				return fail(404, { message: 'Link not found.' });
			}
			await db.delete(trackedLink).where(eq(trackedLink.id, Number(id)));
			await log(locals.user?.id, 'delete_tracked_link', {
				targetId: id,
				data: linkToDelete
			});
			return { success: true, message: 'Link deleted successfully.' };
		} catch (error) {
			console.error('Error deleting tracked link:', error);
			return fail(500, { message: 'Could not delete link.' });
		}
	}
};