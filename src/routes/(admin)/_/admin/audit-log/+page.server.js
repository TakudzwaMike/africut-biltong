import { db } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema.js';
import { desc } from 'drizzle-orm';

export async function load() {
	const logs = await db.query.auditLog.findMany({
		orderBy: desc(auditLog.createdAt),
		with: {
			user: {
				columns: {
					username: true
				}
			}
		},
		limit: 100 // To prevent loading too many records at once
	});
	return { logs };
}