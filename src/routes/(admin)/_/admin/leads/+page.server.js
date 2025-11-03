import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const leads = await db.query.lead.findMany({
		orderBy: desc(leadTable.createdAt),
		with: {
			solution: true
		}
	});
	return { leads };
}