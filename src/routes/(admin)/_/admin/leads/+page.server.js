import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { log } from '$lib/server/auditLog.js';

export async function load() {
	const leads = await db.query.lead.findMany({
		orderBy: desc(lead.createdAt),
		with: {
			solution: true
		}
	});
	return { leads };
}

export const actions = {
	updateStatus: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const status = formData.get('status');

		if (isNaN(id) || !status) {
			return fail(400, { message: 'Invalid request.' });
		}

		try {
			await db.update(lead).set({ status: String(status) }).where(eq(lead.id, id));

			await log(locals.user?.id, 'update_lead_status', {
				targetId: id,
				data: { status }
			});

			return { success: true, message: 'Status updated.' };
		} catch (error) {
			console.error('Error updating lead status:', error);
			return fail(500, { message: 'Could not update status.' });
		}
	}
};