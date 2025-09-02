import { db } from '$lib/server/db';
import { trackedLink } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import { log } from '$lib/server/auditLog.js';
import { customAlphabet } from 'nanoid';

// Generate short, URL-friendly unique IDs
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export async function load({ locals }) {
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
					id: true // Just to get a count
				}
			}
		}
	});
	return { links };
}

export const actions = {
	create: async ({ request, locals }) => {
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